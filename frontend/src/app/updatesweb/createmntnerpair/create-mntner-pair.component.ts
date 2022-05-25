import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { IUserInfoResponseData } from '../../dropdown/org-data-type.model';
import { PropertiesService } from '../../properties.service';
import { AlertsService } from '../../shared/alert/alerts.service';
import { WhoisMetaService } from '../../shared/whois-meta.service';
import { WhoisResourcesService } from '../../shared/whois-resources.service';
import { IAttributeModel } from '../../shared/whois-response-type.model';
import { UserInfoService } from '../../userinfo/user-info.service';
import { CreateService } from '../create.service';
import { ErrorReporterService } from '../error-reporter.service';
import { LinkService } from '../link.service';
import { MessageStoreService } from '../message-store.service';
import { RestService } from '../rest.service';

@Component({
    selector: 'create-mntner-pair',
    templateUrl: './create-mntner-pair.component.html',
})
export class CreateMntnerPairComponent implements OnInit, OnDestroy {
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

    constructor(
        public whoisResourcesService: WhoisResourcesService,
        private whoisMetaService: WhoisMetaService,
        private userInfoService: UserInfoService,
        private restService: RestService,
        private createService: CreateService,
        public messageStoreService: MessageStoreService,
        private errorReporterService: ErrorReporterService,
        private linkService: LinkService,
        private properties: PropertiesService,
        public alertsService: AlertsService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
    ) {}

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

        // kick off ajax-call to fetch email address of logged-in user
        this.userInfoService.getUserOrgsAndRoles().subscribe(
            (result: IUserInfoResponseData) => {
                this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'auth', 'SSO ' + result.user.username);
                this.mntnerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.mntnerAttributes, 'upd-to', result.user.username);
            },
            () => {
                this.alertsService.setGlobalError('Error fetching SSO information');
            },
        );
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
            .subscribe(
                (resp: any) => {
                    this.submitInProgress = false;

                    const objectTypeUid = this.addObjectOfTypeToCache(resp, this.objectType, 'nic-hdl');
                    const mntnerName = this.addObjectOfTypeToCache(resp, 'mntner', 'mntner');

                    this.navigateToDisplayPage(this.source, objectTypeUid, mntnerName);
                },
                (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertsService.addAlertMsgs(whoisResources);
                    this.alertsService.populateFieldSpecificErrors(this.objectType, this.objectTypeAttributes, whoisResources);
                    this.alertsService.populateFieldSpecificErrors('mntner', this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log('Create', this.objectType, this.alertsService.alerts.errors, this.objectTypeAttributes);
                    this.errorReporterService.log('Create', 'mntner', this.alertsService.alerts.errors, this.mntnerAttributes);
                },
            );
    }

    private createPersonMntnerPair() {
        this.createService
            .createPersonMntner(this.source, this.whoisResourcesService.turnAttrsIntoWhoisObjects([this.objectTypeAttributes, this.mntnerAttributes]))
            .subscribe(
                (resp: any) => {
                    this.submitInProgress = false;

                    const personUid = this.addObjectOfTypeToCache(resp, 'person', 'nic-hdl');
                    const mntnerName = this.addObjectOfTypeToCache(resp, 'mntner', 'mntner');

                    this.navigateToDisplayPage(this.source, personUid, mntnerName);
                },
                (error: any) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.alertsService.addAlertMsgs(whoisResources);
                    this.alertsService.populateFieldSpecificErrors('person', this.objectTypeAttributes, whoisResources);
                    this.alertsService.populateFieldSpecificErrors('mntner', this.mntnerAttributes, whoisResources);

                    this.errorReporterService.log('Create', 'person', this.alertsService.alerts.errors, this.objectTypeAttributes);
                    this.errorReporterService.log('Create', 'mntner', this.alertsService.alerts.errors, this.mntnerAttributes);
                },
            );
    }

    public cancel() {
        if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
            this.router.navigate(['webupdates/select']);
        }
    }

    public fieldVisited(attr: IAttributeModel) {
        console.debug('fieldVisited:' + JSON.stringify(attr));
        if (attr.name === 'person') {
            attr.$$error = !attr.value || this.personRe.exec(attr.value) ? '' : 'Input contains unsupported characters.';
            attr.$$invalid = !!attr.$$error;
        }
        if (attr.$$meta.$$primaryKey === true) {
            attr.$$error = '';
            this.restService
                .autocomplete(attr.name, attr.value, true, [])
                .toPromise()
                .then((data: any) => {
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
