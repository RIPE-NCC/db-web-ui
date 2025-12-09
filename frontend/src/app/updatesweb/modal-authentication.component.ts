import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { BannerComponent, BannerTypes } from '../banner/banner.component';
import { IUserInfoResponseData } from '../dropdown/org-data-type.model';
import { PropertiesService } from '../properties.service';
import { CredentialsService } from '../shared/credentials.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IWhoisResponseModel } from '../shared/whois-response-type.model';
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

// https://apps.db.ripe.net/docs/Appendices/Appendix-D--Route-Object-Creation-Flowchart.html
@Component({
    selector: 'modal-authentication',
    templateUrl: './modal-authentication.component.html',
    standalone: true,
    imports: [FormsModule, BannerComponent, RouterLink, MatButton],
})
export class ModalAuthenticationComponent implements OnInit {
    private activeModal = inject(NgbActiveModal);
    whoisResourcesService = inject(WhoisResourcesService);
    restService = inject(RestService);
    userInfoService = inject(UserInfoService);
    credentialsService = inject(CredentialsService);
    properties = inject(PropertiesService);

    public close: any;
    @Input()
    public resolve: IModalAuthentication;

    public PORTAL_URL: string;
    public SOURCE: string;
    public selected: any;
    public allowedObjectTypes: string[] = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];
    public fmpPath: string;
    errorMsg: string;

    constructor() {
        const properties = this.properties;

        this.SOURCE = properties.SOURCE;
        this.PORTAL_URL = properties.PORTAL_URL;
    }

    public ngOnInit() {
        this.selected = {
            associate: true,
            item: this.resolve.mntners[0],
            message: undefined,
            password: '',
        };
        this.setFmpPathQueryParam();
        this.allowForceDelete();
        this.errorMsg = `The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer <a href="${this.PORTAL_URL}#/account-details">here</a>.`;
    }

    public allowForceDelete() {
        if (this.resolve.method === 'ForceDelete') {
            return false;
        }
        return this.resolve.allowForcedDelete && _.includes(this.allowedObjectTypes, this.resolve.objectType);
    }

    // password prefilled for TEST maintainers - defined in properties
    public onChangeMnt() {
        this.selected.password = '';
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
        this.restService.fetchObjectByOverride(this.SOURCE, 'mntner', this.selected.item.key, this.selected.password).subscribe({
            next: (whoisResources: IWhoisResponseModel) => {
                if (this.whoisResourcesService.isFiltered(whoisResources)) {
                    this.selected.message = "You have not supplied the correct password for mntner: '" + this.selected.item.key + "'";
                    return;
                }

                this.credentialsService.setCredentials(this.selected.item.key, this.selected.password);
                this.userInfoService.getUserOrgsAndRoles().subscribe((userInfo: IUserInfoResponseData) => {
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
        if (this.selected.item?.key) {
            this.fmpPath = `/db-web-ui/fmp?mntnerKey=${this.selected.item.key}`;
        }
    }

    protected readonly BannerTypes = BannerTypes;
}
