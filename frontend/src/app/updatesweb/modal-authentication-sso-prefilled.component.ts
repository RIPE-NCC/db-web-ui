import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { IUserInfoResponseData } from '../dropdown/org-data-type.model';
import { PropertiesService } from '../properties.service';
import { CredentialsService } from '../shared/credentials.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IWhoisResponseModel } from '../shared/whois-response-type.model';
import { UserInfoService } from '../userinfo/user-info.service';

import { IModalAuthentication } from './modal-authentication.component';
import { RestService } from './rest.service';

@Component({
    selector: 'modal-authentication-sso-prefilled',
    templateUrl: './modal-authentication-sso-prefilled.component.html',
    standalone: false,
})
export class ModalAuthenticationSSOPrefilledComponent implements OnInit {
    public close: any;
    @Input()
    public resolve: IModalAuthentication;
    public PORTAL_URL: string;
    public SOURCE: string;
    public selected: any;
    public override: string;

    constructor(
        private activeModal: NgbActiveModal,
        public whoisResourcesService: WhoisResourcesService,
        public userInfoService: UserInfoService,
        public credentialsService: CredentialsService,
        public restService: RestService,
        public properties: PropertiesService,
    ) {
        this.SOURCE = properties.SOURCE;
        this.PORTAL_URL = properties.PORTAL_URL;
        this.override = properties.WHOIS_OVERRIDE + ',Automatically Added SSO {notify=false}';
    }

    public ngOnInit() {
        this.selected = {
            item: this.resolve.mntners[0],
            message: undefined,
        };
    }

    public cancel(reason?: string) {
        this.activeModal.dismiss(reason);
    }

    public submit() {
        if (!this.selected.item || !this.selected.item.key) {
            return;
        }
        this.restService.authenticate(this.SOURCE, 'mntner', this.selected.item.key, undefined, this.override).subscribe({
            next: (whoisResources: IWhoisResponseModel) => {
                this.credentialsService.setCredentials(this.selected.item.key, this.override);
                this.setSSOAccount(whoisResources);
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

    private setSSOAccount(whoisResources: IWhoisResponseModel) {
        this.userInfoService.getUserOrgsAndRoles().subscribe((userInfo: IUserInfoResponseData) => {
            const ssoUserName = userInfo.user.username;
            if (ssoUserName) {
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
                    .associateSSOMntnerByOverride(
                        this.whoisResourcesService.getSource(whoisResources),
                        'mntner',
                        this.selected.item.key,
                        this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes),
                        this.override,
                    )
                    .subscribe({
                        next: (resp: any) => {
                            this.selected.item.mine = true;
                            this.addSSOAsAuthMethod();
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
    }

    private addSSOAsAuthMethod() {
        if (!this.selected.item.auth) {
            this.selected.item.auth = ['SSO'];
        } else {
            this.selected.item.auth.push('SSO');
        }
    }
}
