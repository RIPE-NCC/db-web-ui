import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { PropertiesService } from '../properties.service';
import { CredentialsService } from '../shared/credentials.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { RestService } from './rest.service';

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
    selector: 'modal-authentication',
    templateUrl: './modal-authentication.component.html',
})
export class ModalAuthenticationComponent implements OnInit {
    public close: any;
    @Input()
    public resolve: IModalAuthentication;

    public PORTAL_URL: string;
    public SOURCE: string;
    public selected: any;
    public allowedObjectTypes: string[] = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];
    public fmpPath: string;

    constructor(
        private activeModal: NgbActiveModal,
        public whoisResourcesService: WhoisResourcesService,
        public restService: RestService,
        public userInfoService: UserInfoService,
        public credentialsService: CredentialsService,
        public properties: PropertiesService,
    ) {
        this.SOURCE = properties.SOURCE;
        this.PORTAL_URL = properties.PORTAL_URL;
    }

    public ngOnInit() {
        this.selected = {
            associate: true,
            item: this.resolve.mntners[0],
            message: undefined,
            password: this.properties.MNTNER_ALLOWED_TO_CREATE_AUTNUM[this.resolve.mntners[0]?.key] || '',
        };
        this.setFmpPathQueryParam();
        this.allowForceDelete();
    }

    public allowForceDelete() {
        if (this.resolve.method === 'ForceDelete') {
            return false;
        }
        return this.resolve.allowForcedDelete && _.includes(this.allowedObjectTypes, this.resolve.objectType);
    }

    // password prefilled for TEST maintainers - defined in properties
    public onChangeMnt() {
        this.selected.password = this.properties.MNTNER_ALLOWED_TO_CREATE_AUTNUM[this.selected.item.key] || '';
        this.setFmpPathQueryParam();
    }

    public cancel(reason?: string) {
        this.activeModal.dismiss(reason);
    }

    public submit() {
        if (this.selected.password.length === 0 && this.selected.item) {
            this.selected.message = "Password for mntner: '" + this.selected.item.key + "'" + ' too short';
            return;
        }
        if (!this.selected.item || !this.selected.item.key) {
            return;
        }
        this.restService.authenticate(this.resolve.method, this.SOURCE, 'mntner', this.selected.item.key, this.selected.password).subscribe({
            next: (whoisResources: any) => {
                if (this.whoisResourcesService.isFiltered(whoisResources)) {
                    this.selected.message = "You have not supplied the correct password for mntner: '" + this.selected.item.key + "'";
                    return;
                }

                this.credentialsService.setCredentials(this.selected.item.key, this.selected.password);
                this.userInfoService.getUserOrgsAndRoles().subscribe((userInfo: any) => {
                    const ssoUserName = userInfo.user.username;
                    if (this.selected.associate && ssoUserName) {
                        // append auth-md5 attribute
                        const attributes = this.whoisResourcesService.addAttributeAfterType(
                            this.whoisResourcesService.getAttributes(whoisResources),
                            {
                                name: 'auth',
                                value: 'SSO ' + ssoUserName,
                            },
                            { name: 'auth' },
                        );
                        AttributeMetadataService.splitAttrsCommentsFromValue(attributes, false);
                        // do adjust the maintainer
                        this.restService
                            .associateSSOMntner(
                                this.whoisResourcesService.getSource(whoisResources),
                                'mntner',
                                this.selected.item.key,
                                this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes),
                                this.selected.password,
                            )
                            .subscribe({
                                next: (resp: any) => {
                                    this.selected.item.mine = true;
                                    this.selected.item.auth.push('SSO');
                                    this.credentialsService.removeCredentials(); // because it's now an sso mntner
                                    // report success back
                                    this.activeModal.close({
                                        $value: {
                                            selectedItem: this.selected.item,
                                            response: resp,
                                        },
                                    });
                                },
                                error: (error: any) => {
                                    if (
                                        !_.isUndefined(error.error) &&
                                        !_.isUndefined(error.error.errormessages) &&
                                        !_.isUndefined(error.error.errormessages.errormessage[0])
                                    ) {
                                        const errorMsg = error.error.errormessages.errormessage[0];
                                        this.selected.message = error.status === 401 ? WhoisResourcesService.readableError(errorMsg) : errorMsg.text;
                                        return;
                                    }
                                    // remove modal anyway
                                    this.activeModal.close({ $value: { selectedItem: this.selected.item } });
                                },
                            });
                    } else {
                        console.debug('No need to associate');
                        // report success back
                        this.activeModal.close({ $value: { selectedItem: this.selected.item } });
                    }
                });
            },
            error: (error: any) => {
                console.info('Authentication error:' + error);

                if (!_.isUndefined(error.data)) {
                    this.selected.message = _.reduce(this.whoisResourcesService.getGlobalErrors(error.data), (total, msg) => {
                        return total + '\n' + msg;
                    });
                } else {
                    this.selected.message = "Error performing validation for mntner: '" + this.selected.item.key + "'";
                }
            },
        });
    }

    private setFmpPathQueryParam() {
        this.fmpPath = `/db-web-ui/fmp?mntnerKey=${this.selected.item.key}`;
    }
}
