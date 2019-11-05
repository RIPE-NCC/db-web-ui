import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {PropertiesService} from "../../../properties.service";
import {AlertsService} from "../../../shared/alert/alerts.service";
import {WhoisResourcesService} from "../../../shared/whois-resources.service";
import {WhoisMetaService} from "../../../shared/whois-meta.service";
import {UserInfoService} from "../../../userinfo/user-info.service";
import {RestService} from "../../rest.service";
import {MessageStoreService} from "../../message-store.service";
import {ErrorReporterService} from "../../error-reporter.service";
import {LinkService} from "../../link.service";
import {IAttributeModel} from "../../../shared/whois-response-type.model";
import {IUserInfoResponseData} from "../../../dropdown/org-data-type.model";
import {CreateService} from "../create.service";

@Component({
    selector: "create-mntner-pair",
    templateUrl: "./create-mntner-pair.component.html",
})
export class CreateMntnerPairComponent {

    public submitInProgress: boolean;
    public source: string;
    public objectTypeAttributes: any;
    public mntnerAttributes: any;
    public objectType: string;
    public personRe: RegExp = new RegExp(/^[A-Z][A-Z0-9\\.`'_-]{0,63}(?: [A-Z0-9\\.`'_-]{1,64}){0,9}$/i);
    public showMntAttrsHelp: [];
    public showAttrsHelp: [];
    public linkToRoleOrPerson: string = "person";
    private subscription: any;

    constructor(public alertService: AlertsService,
                public whoisResourcesService: WhoisResourcesService,
                private whoisMetaService: WhoisMetaService,
                private userInfoService: UserInfoService,
                private restService: RestService,
                private createService: CreateService,
                public messageStoreService: MessageStoreService,
                private errorReporterService: ErrorReporterService,
                private linkService: LinkService,
                private properties: PropertiesService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {

        this.subscription = this.activatedRoute.params.subscribe((() => {
            this.init();
        }));
    }

    public init() {

        this.submitInProgress = false;

        this.alertService.clearErrors();

        this.source = this.properties.SOURCE;

        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectType = paramMap.get("personOrRole");
        this.linkToRoleOrPerson = this.isObjectTypeRole() ? "person" : "role";
        this.objectTypeAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType,
            this.whoisMetaService.getMandatoryAttributesOnObjectType(this.objectType));
        this.objectTypeAttributes.setSingleAttributeOnName("nic-hdl", "AUTO-1");
        this.objectTypeAttributes.setSingleAttributeOnName("source", this.source);
        this.showAttrsHelp = this.objectTypeAttributes.map((attr: IAttributeModel) => ({[attr.name]: true}));

        this.mntnerAttributes = this.whoisResourcesService.wrapAndEnrichAttributes("mntner",
            this.whoisMetaService.getMandatoryAttributesOnObjectType("mntner"));
        this.mntnerAttributes.setSingleAttributeOnName("admin-c", "AUTO-1");
        this.mntnerAttributes.setSingleAttributeOnName("source", this.source);
        this.showMntAttrsHelp = this.mntnerAttributes.map((attr: IAttributeModel) => ({[attr.name]: true}));

        // kick off ajax-call to fetch email address of logged-in user
        this.userInfoService.getUserOrgsAndRoles()
            .subscribe((result: IUserInfoResponseData) => {
                this.mntnerAttributes.setSingleAttributeOnName("auth", "SSO " + result.user.username);
                this.mntnerAttributes.setSingleAttributeOnName("upd-to", result.user.username);
            }, () => {
                this.alertService.setGlobalError("Error fetching SSO information");
            },
        );
    }

    public submit() {

        console.log("ERROR", this.objectTypeAttributes);

        this.populateMissingAttributes();

        const mntner = this.mntnerAttributes.getSingleAttributeOnName("mntner");
        if (!_.isUndefined(mntner.value)) {
            this.objectTypeAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
            this.mntnerAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
        }

        if (!this.validateForm()) {
            this.errorReporterService.log("Create", this.objectType, this.alertService.getErrors(), this.objectTypeAttributes);
            this.errorReporterService.log("Create", "mntner", this.alertService.getErrors(), this.mntnerAttributes);

        } else {
            this.alertService.clearErrors();

            this.submitInProgress = true;
            this.isObjectTypeRole() ? this.createRoleMntnerPair() : this.createPersonMntnerPair();
        }
    }

    private populateMissingAttributes() {
        const mntner = this.mntnerAttributes.getSingleAttributeOnName("mntner");
        if (!_.isUndefined(mntner.value)) {
            this.objectTypeAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
            this.mntnerAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
        }
    }

    private isObjectTypeRole() {
        return this.objectType === "role"
    }

    private createRoleMntnerPair() {
        this.createService.createRoleMntner(this.source,
            this.whoisResourcesService.turnAttrsIntoWhoisObjects([this.objectTypeAttributes, this.mntnerAttributes]))
            .subscribe((resp: any) => {
                    this.submitInProgress = false;

                    const objectTypeUid = this.addObjectOfTypeToCache(resp, this.objectType, "nic-hdl");
                    const mntnerName = this.addObjectOfTypeToCache(resp, "mntner", "mntner");

                    this.navigateToDisplayPage(this.source, objectTypeUid, mntnerName);

                }, (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertService.addErrors(whoisResources);
                    this.alertService.populateFieldSpecificErrors(this.objectType, this.objectTypeAttributes, whoisResources);
                    this.alertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log("Create", this.objectType, this.alertService.getErrors(), this.objectTypeAttributes);
                    this.errorReporterService.log("Create", "mntner", this.alertService.getErrors(), this.mntnerAttributes);
                },
            );
    }

    private createPersonMntnerPair() {
        this.createService.createPersonMntner(this.source,
            this.whoisResourcesService.turnAttrsIntoWhoisObjects([this.objectTypeAttributes, this.mntnerAttributes]))
            .subscribe((resp: any) => {
                    this.submitInProgress = false;

                    const personUid = this.addObjectOfTypeToCache(resp, "person", "nic-hdl");
                    const mntnerName = this.addObjectOfTypeToCache(resp, "mntner", "mntner");

                    this.navigateToDisplayPage(this.source, personUid, mntnerName);

                }, (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertService.addErrors(whoisResources);
                    this.alertService.populateFieldSpecificErrors("person", this.objectTypeAttributes, whoisResources);
                    this.alertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log("Create", "person", this.alertService.getErrors(), this.objectTypeAttributes);
                    this.errorReporterService.log("Create", "mntner", this.alertService.getErrors(), this.mntnerAttributes);
                },
            );
    }

    public cancel() {
        if (window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.router.navigate(["webupdates/select"]);
        }
    }

    public fieldVisited(attr: IAttributeModel) {
        console.debug("fieldVisited:" + JSON.stringify(attr));
        if (attr.name === "person") {
            attr.$$error = (!attr.value || this.personRe.exec(attr.value)) ? "" : "Input contains unsupported characters.";
            attr.$$invalid = !!attr.$$error;
        }
        if (attr.$$meta.$$primaryKey === true) {
            attr.$$error = "";
            this.restService.autocomplete(attr.name, attr.value, true, []).then((data: any) => {
                    const found = _.find(data, (item: any) => {
                        if (item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase()) {
                            return item;
                        }
                    });
                    if (!_.isUndefined(found)) {
                        attr.$$error = attr.name + " " + this.linkService.getModifyLink(this.source, attr.name, found.key) + " already exists";
                    }
                },
            );
        }
    }

    public setVisibilityAttrsHelp(attributeName: string) {
        this.showAttrsHelp[attributeName] = !this.showAttrsHelp[attributeName]
    }

    private validateForm() {
        const roleValid = this.objectTypeAttributes.validate();
        const mntnerValid = this.mntnerAttributes.validate();
        return roleValid && mntnerValid;
    }

    public isFormValid() {
        this.populateMissingAttributes();
        const roleValid = this.objectTypeAttributes.validateWithoutSettingErrors();
        const mntnerValid = this.mntnerAttributes.validateWithoutSettingErrors();
        return roleValid && mntnerValid;
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public getAttributeDescription(attrName: string) {
        return this.whoisMetaService.getAttributeDescription(this.objectType, attrName);
    }

    public getAttributeSyntax(attrName: string) {
        return this.whoisMetaService.getAttributeSyntax(this.objectType, attrName);
    }

    private navigateToDisplayPage(source: string, roleName: string, mntnerName: string) {
        this.router.navigateByUrl(`webupdates/display/${source}/${this.objectType}/${roleName}/mntner/${mntnerName}`);
    }

    private addObjectOfTypeToCache(whoisResources: any, objectType: string, keyFieldName: string) {
        let uid;
        const attrs = this.whoisResourcesService.getAttributesForObjectOfType(whoisResources, objectType);
        if (attrs.length > 0) {
            uid = this.whoisResourcesService.wrapAttributes(attrs).getSingleAttributeOnName(keyFieldName).value;
            this.messageStoreService.add(uid, this.whoisResourcesService.turnAttrsIntoWhoisObject(attrs));
        }
        return uid;
    }
}
