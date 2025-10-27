import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { JsUtilService } from '../core/js-utils.service';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IAttributeModel, IMntByModel, IWhoisObjectModel } from '../shared/whois-response-type.model';
import { IMaintainers } from '../updatesweb/create-modify.component';
import { MntnerService } from '../updatesweb/mntner.service';
import { ObjectUtilService } from '../updatesweb/object-util.service';
import { RestService } from '../updatesweb/rest.service';
import { IAuthParams, WebUpdatesCommonsService } from '../updatesweb/web-updates-commons.service';
import { IDefaultMaintainer, IWhoisObject } from './types';

@Component({
    selector: 'maintainers-editor',
    templateUrl: './maintainers-editor.component.html',
    standalone: false,
})
export class MaintainersEditorComponent implements OnInit {
    @Input()
    public whoisObject: IWhoisObjectModel;
    @Output()
    public authenticationFailedClbk = new EventEmitter();
    @Output()
    public authenticationSuccessClbk = new EventEmitter();
    @Output()
    public updateMntnersClbk: EventEmitter<any> = new EventEmitter<any>();
    public subscription: any;

    // Parts of the model used in template
    public attributes: IAttributeModel[];
    public objectType: string;
    public objectName: string;

    // Underlying mntner model
    public mntners: IMaintainers = {
        alternatives$: undefined,
        object: [],
        objectOriginal: [],
        sso: [],
        defaultMntner: [],
    };
    // ng-select
    public loading = false;
    public alternativesInput$ = new Subject<string>();
    // Interface control
    public restCallInProgress = false;

    public message: {
        text: string;
        type: string;
    };
    public isMntHelpShown = false;

    private source: string;
    private justAddedMnt: IMntByModel;
    private selectedOrg: IUserInfoOrganisation;

    constructor(
        private attributeMetadataService: AttributeMetadataService,
        public mntnerService: MntnerService,
        public restService: RestService,
        private webUpdatesCommonsService: WebUpdatesCommonsService,
        public alertsService: AlertsService,
        private jsUtilsService: JsUtilService,
        public orgDropDownSharedService: OrgDropDownSharedService,
        private properties: PropertiesService,
    ) {
        this.subscription = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.ngOnInit();
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public ngOnInit() {
        this.mntnerAutocomplete();
        this.source = this.whoisObject.source.id;
        this.attributes = this.whoisObject.attributes.attribute;
        this.objectType = this.attributes[0].name;
        this.objectName = this.attributes[0].value;
        if (this.objectType === 'route' || this.objectType === 'route6') {
            this.objectName += this.attributes.find((attr) => attr.name === 'origin').value;
        }
        if (this.isModifyMode()) {
            this.initModifyMode();
        } else {
            this.initCreateMode();
        }
    }

    public refreshMntners() {
        this.mntnerAutocomplete();
        if (this.isModifyMode()) {
            this.initModifyMode();
        } else {
            this.initCreateMode();
        }
    }

    public onMntnerAdded(item: IMntByModel): void {
        this.justAddedMnt = item;
        // enrich with new-flag
        this.mntners.object = this.mntnerService.enrichWithNewStatus(this.mntners.objectOriginal, this.mntners.object);

        this.mergeMaintainers(this.attributes, { name: 'mnt-by', value: item.key });

        if (this.mntnerService.needsPasswordAuthentication(this.mntners.sso, this.mntners.objectOriginal, this.mntners.object)) {
            this.performAuthentication();
        }
        this.attributeMetadataService.enrich(this.objectType, this.attributes);
        this.whoisObject.attributes.attribute = this.attributes;
        this.updateMntnersClbk.emit(this.mntners);
    }

    public onMntnerRemoved(item: IMntByModel): void {
        this.mntners.object = this.mntners.object.filter((mnt) => mnt.key !== item.key);
        // don't remove if it's the last one -- just empty it
        const objectMntBys = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name === 'mnt-by';
        });
        if (objectMntBys.length > 1) {
            _.remove(this.attributes, (i: IAttributeModel) => {
                return i.name === 'mnt-by' && i.value === item.key;
            });
        } else {
            objectMntBys[0].value = '';
        }
        this.attributeMetadataService.enrich(this.objectType, this.attributes);
        this.whoisObject.attributes.attribute = this.attributes;
        this.updateMntnersClbk.emit(this.mntners);
    }

    public isLirObject() {
        return ObjectUtilService.isLirObject(this.attributes, this.objectType);
    }

    public isModifyWithSingleMntnerRemaining() {
        return this.isModifyMode() && this.mntners.object.length === 1;
    }

    public trackByFn(item: IMntByModel) {
        return item.key;
    }

    public mntnerAutocomplete() {
        this.mntners.alternatives$ = concat(
            of([]), // default items
            this.alternativesInput$.pipe(
                distinctUntilChanged(),
                tap(() => (this.loading = true)),
                switchMap((term) =>
                    this.restService.autocomplete('mnt-by', term, true, ['auth']).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => (this.loading = false)),
                    ),
                ),
                map((data: IMntByModel[]) =>
                    this.mntnerService.stripNccMntners(
                        // Filter mntner set in mntners search bar
                        this.mntnerService.enrichWithNewStatus(
                            this.mntners.objectOriginal,
                            this.mntnerService.filterAutocompleteMntners(this.mntners.object, this.enrichWithMine(data)), //Filter autocomplete dropdown
                        ),
                    ),
                ),
            ),
        );
    }

    // hot-wire the mntnerService functions
    public hasMd5 = (mntner: IMntByModel) => this.mntnerService.hasMd5(mntner);
    public hasPgp = (mntner: IMntByModel) => this.mntnerService.hasPgp(mntner);
    public hasSSo = (mntner: IMntByModel) => this.mntnerService.hasSSo(mntner);
    public isRemovable = (mntnerKey: string) => this.mntnerService.isRemovable(mntnerKey);

    public showMntCloseButton(mntner: IMntByModel): boolean {
        return !this.isModifyWithSingleMntnerRemaining() && this.isRemovable(mntner.key) && !this.isLirObject();
    }

    public isClearable(): boolean {
        return this.mntners.object[0] ? this.showMntCloseButton(this.mntners.object[0]) : false;
    }

    private performAuthentication(): void {
        const authParams: IAuthParams = {
            failureClbk: () => this.navigateAway(),
            isLirObject: this.isLirObject(),
            maintainers: this.mntners,
            object: {
                name: this.objectName,
                source: this.source,
                type: this.objectType,
            },
            operation: this.isModifyMode() ? 'Modify' : 'Create',
            successClbk: this.onSuccessfulAuthentication,
        };
        this.webUpdatesCommonsService.performAuthentication(authParams);
    }

    private navigateAway(): void {
        if (!this.isModifyMode()) {
            this.onMntnerRemoved(this.justAddedMnt);
            this.justAddedMnt = undefined;
        }
        if (this.authenticationFailedClbk) {
            this.authenticationFailedClbk.emit();
        }
    }

    private onSuccessfulAuthentication = (associationResp: any) => {
        this.authenticationSuccessClbk.emit(associationResp);
    };

    private handleSsoResponse(results: IMntByModel[]): void {
        this.restCallInProgress = false;
        this.mntners.sso = results;
        if (this.mntners.sso.length > 0) {
            this.mntners.objectOriginal = [];
            // copy mntners to attributes (for later submit)
            const mntnerAttrs = this.mntners.sso.map((i: IMntByModel) => {
                return {
                    name: 'mnt-by',
                    value: i.key,
                };
            });
            this.mergeMaintainers(this.attributes, mntnerAttrs);
            this.attributeMetadataService.enrich(this.objectType, this.attributes);
            this.filterPrefilledSsoMntsToDefaultMnts();
        }
    }

    private handleSsoResponseError(): void {
        this.restCallInProgress = false;
        this.message = {
            text: 'Error fetching maintainers associated with this SSO account',
            type: 'error',
        };
        this.alertsService.setGlobalError('Error fetching maintainers associated with this SSO account');
    }

    private filterPrefilledSsoMntsToDefaultMnts() {
        this.selectedOrg = this.orgDropDownSharedService.getSelectedOrg();
        this.mntners.defaultMntner = [];
        //@ts-ignore only LIR can have default maintainer
        if (this.selectedOrg && !!this.selectedOrg.regId && !this.properties.isTestEnv()) {
            this.mntnerService.getDefaultMaintainers(this.selectedOrg.orgObjectId).subscribe({
                next: (result: IDefaultMaintainer) => {
                    this.intersectionDefaultMntAndSsoMnt(result);
                    this.populateNgSelectFieldWithMnt();
                },
                error: (error: any) => {
                    this.populateNgSelectFieldWithMnt();
                },
            });
        } else {
            this.populateNgSelectFieldWithMnt();
        }
    }

    private intersectionDefaultMntAndSsoMnt(defaultMnts: IDefaultMaintainer) {
        const auth: string[] = [];
        defaultMnts.objects?.object.forEach((object: IWhoisObject) => {
            // get all auth for default mnt
            object.attributes.attribute.map((attr) => {
                if (attr.name === 'auth') {
                    auth.push(attr.value);
                }
            });
            const defaultMnt = {
                key: object.attributes.attribute.find((attr) => attr.name === 'mntner').value,
                type: 'mntner',
                mine: true,
                auth,
            };
            // when default maintainers of selected organisation exist in assigned - sso mnts
            if (
                this.mntners.sso.some((sso: IMntByModel) => {
                    return sso.key === defaultMnt.key;
                })
            ) {
                this.mntners.defaultMntner.push(defaultMnt);
            }
        });
    }

    private populateNgSelectFieldWithMnt() {
        this.mntners.object = this.mntners.defaultMntner.length > 0 ? this.mntners.defaultMntner : _.cloneDeep(this.mntners.sso);
        this.updateMntnersClbk.emit(this.mntners);
    }

    private mergeMaintainers(attrs: IAttributeModel[], maintainers: any): void {
        if (this.jsUtilsService.typeOf(attrs) !== 'array') {
            throw new TypeError('attrs must be an array in mergeMaintainers');
        }
        let i;
        let lastIdxOfType = _.findLastIndex(attrs, (item) => {
            return item.name === 'mnt-by';
        });
        if (lastIdxOfType < 0) {
            lastIdxOfType = attrs.length;
        } else if (!attrs[lastIdxOfType].value) {
            attrs.splice(lastIdxOfType, 1);
        }
        if (this.jsUtilsService.typeOf(maintainers) === 'object') {
            attrs.splice(lastIdxOfType, 0, maintainers);
        } else {
            for (i = 0; i < maintainers.length; i++) {
                attrs.splice(lastIdxOfType + i, 0, maintainers[i]);
            }
        }
    }

    private isModifyMode(): boolean {
        const createdAttr = this.attributes.find((attr: IAttributeModel) => {
            return attr.name.toUpperCase() === 'CREATED';
        });
        return createdAttr && typeof createdAttr.value === 'string' && createdAttr.value.length > 0;
    }

    private initCreateMode() {
        this.restService.fetchMntnersForSSOAccount().subscribe({
            next: (results: IMntByModel[]) => {
                this.handleSsoResponse(results);
            },
            error: () => {
                this.handleSsoResponseError();
            },
        });
    }

    private initModifyMode() {
        this.restService.fetchMntnersForSSOAccount().subscribe({
            next: (ssoResult: IMntByModel[]) => {
                this.restCallInProgress = false;

                // store mntners for SSO account
                this.mntners.sso = ssoResult;
                console.debug('maintainers.sso:', this.mntners.sso);

                // this is where we must authenticate against
                this.mntners.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);

                // starting point for further editing
                const mntnersFromObject = this.extractEnrichMntnersFromObject(this.attributes);
                this.mntners.object = this.mntnerService.removeDuplicatedMnts(mntnersFromObject);

                // fetch details of all selected maintainers concurrently
                this.restCallInProgress = true;
                this.restService.detailsForMntners(this.mntners.object).subscribe({
                    next: (result: any) => {
                        this.restCallInProgress = false;

                        this.mntners.objectOriginal = _.flatten(result) as IMntByModel[];
                        console.debug('mntners-object-original:', this.mntners.objectOriginal);

                        // of course none of the initial ones are new
                        this.mntners.object = this.mntnerService.enrichWithNewStatus(this.mntners.objectOriginal, _.flatten(result));
                        console.debug('mntners-object:', this.mntners.object);

                        if (this.mntnerService.needsPasswordAuthentication(this.mntners.sso, this.mntners.objectOriginal, this.mntners.object)) {
                            this.performAuthentication();
                        }
                        this.updateMntnersClbk.emit(this.mntners);
                    },
                    error: (error: any) => {
                        this.restCallInProgress = false;
                        console.error('Error fetching sso-mntners details', error);
                        this.alertsService.setGlobalError('Error fetching maintainer details');
                    },
                });
                // now let's see if there are any read-only restrictions on these attributes. There is if any of
                // these are true:
                //
                // * this is an inet(6)num and it has a "sponsoring-org" attribute which refers to an LIR
                // * this is an inet(6)num and it has a "org" attribute which refers to an LIR
                // * this is an organisation with an "org-type: LIR" attribute and attribute.name is
                // address|fax|e-mail|phone
            },
            error: (error: any) => {
                this.restCallInProgress = false;
                try {
                    const whoisResources = error.data;
                    this.alertsService.setErrors(whoisResources);
                } catch (e) {
                    console.error('Error fetching sso-mntners for SSO:', error);
                    this.alertsService.setGlobalError('Error fetching maintainers associated with this SSO account');
                }
            },
        });
    }

    private extractEnrichMntnersFromObject(attributes: IAttributeModel[]): IMntByModel[] {
        // get mntners from response
        const mntnersInObject = attributes.filter((i) => {
            return i.name === 'mnt-by';
        });

        // determine if mntner is mine
        return mntnersInObject.map((mntnerAttr: IAttributeModel) => {
            let isMine = false;
            for (const mnt of this.mntners.sso) {
                if (mnt.key === mntnerAttr.value) {
                    isMine = true;
                    break;
                }
            }
            return {
                key: mntnerAttr.value,
                mine: isMine,
                type: 'mntner',
            };
        }) as IMntByModel[];
    }

    private enrichWithMine(mntners: IMntByModel[]) {
        return mntners.map((mntner) => {
            // search in selected list
            mntner.mine = !!this.mntnerService.isMntnerOnlist(this.mntners.sso, mntner);
            return mntner;
        });
    }
}
