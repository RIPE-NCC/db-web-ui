import {Component, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {RestService} from "./rest.service";
import {UserInfoService} from "../userinfo/user-info.service";
import {CredentialsService} from "../shared/credentials.service";
import {PropertiesService} from "../properties.service";

export interface IModalAuthentication {
    method: any;
    objectType: string;
    objectName: string;
    mntners: any;
    mntnersWithoutPassword: any;
    allowForcedDelete: any;
    isLirObject: any;
    source: string;
}

// https://www.ripe.net/support/training/material/bgp-operations-and-security-training-course/route-object-creation-flowchart.pdf
@Component({
    selector: "modal-authentication",
    templateUrl: "./modal-authentication.component.html",
})
export class ModalAuthenticationComponent {
    public close: any;
    @Input()
    public resolve: IModalAuthentication;

    public PORTAL_URL: string;
    public SOURCE: string;
    public selected: any;
    public allowedObjectTypes: string[] = ["inetnum", "inet6num", "route", "route6", "domain"];

    constructor(private activeModal: NgbActiveModal,
                public whoisResourcesService: WhoisResourcesService,
                public restService: RestService,
                public userInfoService: UserInfoService,
                public credentialsService: CredentialsService,
                public properties: PropertiesService) {
        this.SOURCE = properties.SOURCE;
        this.PORTAL_URL = properties.PORTAL_URL;
    }

    public ngOnInit() {
        this.selected = {
            associate: true,
            item: this.resolve.mntners[0],
            message: undefined,
            password: "",
        };
        this.allowForceDelete();
    }

    public allowForceDelete() {
        if (this.resolve.method === "ForceDelete") {
            return false;
        }
        return this.resolve.allowForcedDelete && _.includes(this.allowedObjectTypes, this.resolve.objectType);
    }

    public cancel(reason?: string) {
        this.activeModal.dismiss(reason);
    }

    public submit() {

        if (this.selected.password.length === 0 && this.selected.item) {
            this.selected.message = "Password for mntner: \'" + this.selected.item.key + "\'" + " too short";
            return;
        }

        if (!this.selected.item || !this.selected.item.key) {
            return;
        }
        this.restService.authenticate(this.resolve.method, this.SOURCE, "mntner", this.selected.item.key, this.selected.password)
            .then((result: any) => {
                const whoisResources = result;

                if (this.whoisResourcesService.isFiltered(whoisResources)) {
                    this.selected.message =
                        "You have not supplied the correct password for mntner: \'" + this.selected.item.key + "\'";
                    return;
                }

                this.credentialsService.setCredentials(this.selected.item.key, this.selected.password);
                this.userInfoService.getUserOrgsAndRoles()
                    .subscribe((userInfo: any) => {
                    const ssoUserName = userInfo.user.username;
                    if (this.selected.associate && ssoUserName) {

                        // append auth-md5 attribute
                        const attributes = this.whoisResourcesService.addAttributeAfterType(
                            this.whoisResourcesService.getAttributes(whoisResources), {
                            name: "auth",
                            value: "SSO " + ssoUserName,
                        }, {name: "auth"});

                        // do adjust the maintainer
                        this.restService.associateSSOMntner(this.whoisResourcesService.getSource(whoisResources), "mntner", this.selected.item.key,
                            this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes), this.selected.password)
                            .then((resp: any) => {
                                this.selected.item.mine = true;
                                this.selected.item.auth.push("SSO");
                                this.credentialsService.removeCredentials(); // because it's now an sso mntner
                                // report success back
                                this.activeModal.close({$value: {selectedItem: this.selected.item, response: resp}});
                            }, (error: any) => {
                                if (!_.isUndefined(error.error) && !_.isUndefined(error.error.errormessages)
                                    && !_.isUndefined(error.error.errormessages.errormessage[0])) {
                                    const errorMsg = error.error.errormessages.errormessage[0];
                                    this.selected.message = error.status === 401
                                        ? WhoisResourcesService.readableError(errorMsg)
                                        : errorMsg.text;
                                    return;
                                }
                                // remove modal anyway
                                this.activeModal.close({$value: {selectedItem: this.selected.item}})
                            });
                    } else {
                        console.debug("No need to associate");
                        // report success back
                        this.activeModal.close({$value: {selectedItem: this.selected.item}})
                    }
                });
            }, (error: any) => {
                console.error("Authentication error:" + error);

                if (!_.isUndefined(error.data)) {
                    this.selected.message = _.reduce(this.whoisResourcesService.getGlobalErrors(error.data), (total, msg) => {
                        return total + "\n" + msg;
                    });
                } else {
                    this.selected.message =
                        "Error performing validation for mntner: \'" + this.selected.item.key + "\'";
                }
            },
        );
    }
}
