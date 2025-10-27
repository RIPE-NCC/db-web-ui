import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as _ from 'lodash';
import { IUserInfoResponseData } from '../../dropdown/org-data-type.model';
import { PropertiesService } from '../../properties.service';
import { AlertsService } from '../../shared/alert/alerts.service';
import { DescriptionSyntaxComponent } from '../../shared/descriptionsyntax/description-syntax.component';
import { FilteroutAttributeByNamePipe } from '../../shared/filterout-attribute-by-name.pipe';
import { SanitizeImgHtmlPipe } from '../../shared/sanitize-img-html.pipe';
import { SubmittingAgreementComponent } from '../../shared/submitting-agreement.component';
import { WhoisMetaService } from '../../shared/whois-meta.service';
import { WhoisResourcesService } from '../../shared/whois-resources.service';
import { IAttributeModel } from '../../shared/whois-response-type.model';
import { UserInfoService } from '../../userinfo/user-info.service';
import { CreateService } from '../create.service';
import { ErrorReporterService } from '../error-reporter.service';
import { LinkService } from '../link.service';
import { MessageStoreService } from '../message-store.service';
import { RestService } from '../rest.service';
import { ScreenLogicInterceptorService } from '../screen-logic-interceptor.service';

@Component({
    selector: 'create-mntner-pair',
    templateUrl: './create-mntner-pair.component.html',
    imports: [
        NgFor,
        NgIf,
        FormsModule,
        DescriptionSyntaxComponent,
        RouterLink,
        SubmittingAgreementComponent,
        MatButton,
        FilteroutAttributeByNamePipe,
        SanitizeImgHtmlPipe,
    ],
})
export class CreateMntnerPairComponent implements OnInit, OnDestroy {
    whoisResourcesService = inject(WhoisResourcesService);
    private whoisMetaService = inject(WhoisMetaService);
    private userInfoService = inject(UserInfoService);
    private restService = inject(RestService);
    private createService = inject(CreateService);
    messageStoreService = inject(MessageStoreService);
    private errorReporterService = inject(ErrorReporterService);
    private linkService = inject(LinkService);
    private properties = inject(PropertiesService);
    alertsService = inject(AlertsService);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);

    public submitInProgress: boolean;
    public source: string;
    public objectTypeAttributes: any;
    public mntnerAttributes: any;
    public objectType: string;
    public personRe: RegExp = new RegExp(/^[A-Z][A-Z0-9\\.`'_-]{0,63}(?: [A-Z0-9\\.`'_-]{1,64}){0,9}$/i);
    public showMntAttrsHelp: [];
    public showAttrsHelp: [];
    public linkToRoleOrPerson: string = 'person';
    private subscription: any;

    public ngOnInit() {
        this.subscription = this.activatedRoute.params.subscribe(() => {
            this.init();
        });
    }

    private init() {
        this.submitInProgress = false;
        this.source = this.properties.SOURCE;

        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectType = paramMap.get('personOrRole');
        this.linkToRoleOrPerson = this.isObjectTypeRole() ? 'person' : 'role';
        this.objectTypeAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(
            this.objectType,
            this.whoisMetaService.getMandatoryAttributesOnObjectType(this.objectType),
        );
        this.objectTypeAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.objectTypeAttributes, 'nic-hdl', 'AUTO-1');
        this.objectTypeAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.objectTypeAttributes, 'source', this.source);
        this.showAttrsHelp = this.objectTypeAttributes.map((attr: IAttributeModel) => ({ [attr.name]: true }));

        this.mntnerAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(
            'mntner',
            this.whoisMetaService.getMandatoryAttributesOnObjectType('mntner'),
        );
        this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'admin-c', 'AUTO-1');
        this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'source', this.source);
        this.showMntAttrsHelp = this.mntnerAttributes.map((attr: IAttributeModel) => ({ [attr.name]: true }));

        this.userInfoService.getUserOrgsAndRoles().subscribe({
            next: (result: IUserInfoResponseData) => {
                this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'auth', 'SSO ' + result.user.username);
                this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'upd-to', result.user.username);
            },
            error: () => {
                this.alertsService.setGlobalError('Error fetching SSO information');
            },
        });
    }

    public submit() {
        console.log('ERROR', this.objectTypeAttributes);

        this.populateMissingAttributes();

        const mntner = this.whoisResourcesService.getSingleAttributeOnName(this.mntnerAttributes, 'mntner');
        if (!_.isUndefined(mntner.value)) {
            this.objectTypeAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.objectTypeAttributes, 'mnt-by', mntner.value);
            this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'mnt-by', mntner.value);
        }

        if (!this.validateForm()) {
            this.errorReporterService.log('Create', this.objectType, this.alertsService.alerts.errors, this.objectTypeAttributes);
            this.errorReporterService.log('Create', 'mntner', this.alertsService.alerts.errors, this.mntnerAttributes);
        } else {
            this.alertsService.clearAlertMessages();

            this.submitInProgress = true;
            this.isObjectTypeRole() ? this.createRoleMntnerPair() : this.createPersonMntnerPair();
        }
    }

    private populateMissingAttributes() {
        const mntner = this.whoisResourcesService.getSingleAttributeOnName(this.mntnerAttributes, 'mntner');
        if (!_.isUndefined(mntner.value)) {
            this.objectTypeAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.objectTypeAttributes, 'mnt-by', mntner.value);
            this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'mnt-by', mntner.value);
        }
    }

    private isObjectTypeRole() {
        return this.objectType === 'role';
    }

    private createRoleMntnerPair() {
        this.createService
            .createRoleMntner(this.source, this.whoisResourcesService.turnAttrsIntoWhoisObjects([this.objectTypeAttributes, this.mntnerAttributes]))
            .subscribe({
                next: (resp: any) => {
                    this.submitInProgress = false;

                    const objectTypeUid = this.addObjectOfTypeToCache(resp, this.objectType, 'nic-hdl');
                    const mntnerName = this.addObjectOfTypeToCache(resp, 'mntner', 'mntner');

                    this.navigateToDisplayPage(this.source, objectTypeUid, mntnerName);
                },
                error: (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertsService.addAlertMsgs(whoisResources);
                    this.alertsService.addGlobalError(`Creation of role and maintainer pair failed, please see below for more details`);
                    this.alertsService.populateFieldSpecificErrors(this.objectType, this.objectTypeAttributes, whoisResources);
                    this.alertsService.populateFieldSpecificErrors('mntner', this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log('Create', this.objectType, this.alertsService.alerts.errors, this.objectTypeAttributes);
                    this.errorReporterService.log('Create', 'mntner', this.alertsService.alerts.errors, this.mntnerAttributes);
                },
            });
    }

    private createPersonMntnerPair() {
        this.createService
            .createPersonMntner(this.source, this.whoisResourcesService.turnAttrsIntoWhoisObjects([this.objectTypeAttributes, this.mntnerAttributes]))
            .subscribe({
                next: (resp: any) => {
                    this.submitInProgress = false;

                    const personUid = this.addObjectOfTypeToCache(resp, 'person', 'nic-hdl');
                    const mntnerName = this.addObjectOfTypeToCache(resp, 'mntner', 'mntner');

                    this.navigateToDisplayPage(this.source, personUid, mntnerName);
                },
                error: (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertsService.addGlobalError(`Creation of person and maintainer pair failed, please see below for more details`);
                    this.alertsService.addAlertMsgs(whoisResources);
                    this.alertsService.populateFieldSpecificErrors('person', this.objectTypeAttributes, whoisResources);
                    this.alertsService.populateFieldSpecificErrors('mntner', this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log('Create', 'person', this.alertsService.alerts.errors, this.objectTypeAttributes);
                    this.errorReporterService.log('Create', 'mntner', this.alertsService.alerts.errors, this.mntnerAttributes);
                },
            });
    }

    public cancel() {
        if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
            void this.router.navigate(['webupdates/select']);
        }
    }

    public fieldVisited(attr: IAttributeModel) {
        attr.$$error = ScreenLogicInterceptorService.setErrorForNonLatin1(attr.value);
        if (attr.name === 'person') {
            attr.$$error = !attr.value || this.personRe.exec(attr.value) ? undefined : 'Input contains unsupported characters.';
            attr.$$invalid = !!attr.$$error;
        }
        if (attr.$$meta.$$primaryKey === true) {
            this.restService.autocomplete(attr.name, attr.value, true, []).subscribe((data: any) => {
                const found = _.find(data, (item: any) => {
                    if (item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase()) {
                        return item;
                    }
                });
                if (!_.isUndefined(found)) {
                    attr.$$error = attr.name + ' ' + this.linkService.getModifyLink(this.source, attr.name, found.key) + ' already exists';
                }
            });
        }
    }

    public setVisibilityMntAttrsHelp(attributeName: string) {
        this.showMntAttrsHelp[attributeName] = !this.showMntAttrsHelp[attributeName];
    }

    public setVisibilityAttrsHelp(attributeName: string) {
        this.showAttrsHelp[attributeName] = !this.showAttrsHelp[attributeName];
    }

    private validateForm() {
        const roleValid = this.whoisResourcesService.validate(this.objectTypeAttributes);
        const mntnerValid = this.whoisResourcesService.validate(this.mntnerAttributes);
        return roleValid && mntnerValid;
    }

    public isFormValid() {
        this.populateMissingAttributes();
        const roleValid = this.whoisResourcesService.validateWithoutSettingErrors(this.objectTypeAttributes);
        const mntnerValid = this.whoisResourcesService.validateWithoutSettingErrors(this.mntnerAttributes);
        return roleValid && mntnerValid;
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private navigateToDisplayPage(source: string, roleName: string, mntnerName: string) {
        this.router.navigateByUrl(`webupdates/display/${source}/${this.objectType}/${roleName}/mntner/${mntnerName}`);
    }

    private addObjectOfTypeToCache(whoisResources: any, objectType: string, keyFieldName: string) {
        let uid;
        const attrs = this.whoisResourcesService.getAttributesForObjectOfType(whoisResources, objectType);
        if (attrs.length > 0) {
            const attr = this.whoisResourcesService.validateAttributes(attrs);
            uid = this.whoisResourcesService.getSingleAttributeOnName(attr, keyFieldName).value;
            this.messageStoreService.add(uid, this.whoisResourcesService.turnAttrsIntoWhoisObject(attrs));
        }
        return uid;
    }
}
