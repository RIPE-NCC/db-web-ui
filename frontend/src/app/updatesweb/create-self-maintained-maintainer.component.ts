import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject, concat, of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { UserInfoService } from '../userinfo/user-info.service';
import { ErrorReporterService } from './error-reporter.service';
import { LinkService } from './link.service';
import { MessageStoreService } from './message-store.service';
import { RestService } from './rest.service';

@Component({
    selector: 'create-self-maintained-maintainer',
    templateUrl: './create-self-maintained-maintainer.component.html',
})
export class CreateSelfMaintainedMaintainerComponent implements OnInit {
    public submitInProgress = false;
    public adminC = {
        object: [],
        alternatives$: undefined,
    };
    public maintainerAttributes: any;
    public source: string;
    public alternativesInput$ = new Subject<string>();
    public loading = false;
    public isAdminCHelpShown: boolean;
    public showAttrsHelp: [];
    private readonly MNT_TYPE: string = 'mntner';

    constructor(
        public whoisResourcesService: WhoisResourcesService,
        public whoisMetaService: WhoisMetaService,
        private userInfoService: UserInfoService,
        private restService: RestService,
        public messageStoreService: MessageStoreService,
        private errorReporterService: ErrorReporterService,
        private linkService: LinkService,
        public alertsService: AlertsService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
    ) {}

    ngOnInit() {
        this.adminCAutocomplete();
        this.alertsService.clearAlertMessages();

        this.maintainerAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(
            this.MNT_TYPE,
            this.whoisMetaService.getMandatoryAttributesOnObjectType(this.MNT_TYPE),
        );

        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.source = paramMap.get('source');
        this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes, 'source', this.source);

        this.showAttrsHelp = this.maintainerAttributes.map((attr: IAttributeModel) => ({ [attr.name]: true }));

        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        if (queryParamMap.has('admin')) {
            const item = { type: 'person', key: queryParamMap.get('admin') };
            this.adminC.object.push(item);
            this.onAdminCAdded(item);
        }

        this.userInfoService.getUserOrgsAndRoles().subscribe({
            next: (result: any) => {
                this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes, 'upd-to', result.user.username);
                this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(
                    this.maintainerAttributes,
                    'auth',
                    'SSO ' + result.user.username,
                );
            },
            error: () => {
                this.alertsService.setGlobalError('Error fetching SSO information');
            },
        });
    }

    public submit() {
        this.populateMissingAttributes();

        console.info('submit attrs:' + JSON.stringify(this.maintainerAttributes));

        this.whoisResourcesService.clearErrors(this.maintainerAttributes);
        if (!this.whoisResourcesService.validate(this.maintainerAttributes)) {
            this.errorReporterService.log('Create', this.MNT_TYPE, this.alertsService.alerts.errors, this.maintainerAttributes);
        } else {
            this.createObject();
        }
    }

    public isFormValid() {
        this.populateMissingAttributes();
        return this.whoisResourcesService.validateWithoutSettingErrors(this.maintainerAttributes);
    }

    public cancel() {
        if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
            void this.router.navigate(['webupdates/select']);
        }
    }

    public fieldVisited(attr: any) {
        this.restService.autocomplete(attr.name, attr.value, true, []).subscribe((data: any) => {
            if (
                _.some(data, (item: any) => {
                    return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                })
            ) {
                attr.$$error = attr.name + ' ' + this.linkService.getModifyLink(this.source, attr.name, attr.value) + ' already exists';
            } else {
                attr.$$error = '';
            }
        });
    }

    public trackByFn(item: any) {
        return item.key;
    }

    public adminCAutocomplete() {
        this.adminC.alternatives$ = concat(
            of([]), // default items
            this.alternativesInput$.pipe(
                distinctUntilChanged(),
                tap(() => (this.loading = true)),
                switchMap((term) =>
                    this.restService.autocomplete('admin-c', term, true, ['person', 'role']).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => (this.loading = false)),
                    ),
                ),
            ),
        );
    }

    public hasAdminC() {
        return this.adminC.object.length > 0;
    }

    public onAdminCAdded(item: any) {
        console.debug('onAdminCAdded:' + JSON.stringify(item));
        this.maintainerAttributes = this.whoisResourcesService.addAttributeAfterType(
            this.maintainerAttributes,
            { name: 'admin-c', value: item.key },
            { name: 'admin-c' },
        );
        this.maintainerAttributes = this.whoisMetaService.enrichAttributesWithMetaInfo(this.MNT_TYPE, this.maintainerAttributes);
        this.maintainerAttributes = this.whoisResourcesService.validateAttributes(this.maintainerAttributes);
    }

    public onAdminCRemoved(item: any) {
        console.debug('onAdminCRemoved:' + JSON.stringify(item));
        _.remove(this.maintainerAttributes, (i: any) => {
            return i.name === 'admin-c' && i.value === item.key;
        });
    }

    public setVisibilityAttrsHelp(attributeName: string) {
        this.showAttrsHelp[attributeName] = !this.showAttrsHelp[attributeName];
    }

    private createObject() {
        this.maintainerAttributes = this.whoisResourcesService.removeNullAttributes(this.maintainerAttributes);

        const obj = this.whoisResourcesService.turnAttrsIntoWhoisObject(this.maintainerAttributes);

        this.submitInProgress = true;
        this.restService.createObject(this.source, this.MNT_TYPE, obj, null).subscribe({
            next: (resp: any) => {
                this.submitInProgress = false;

                const primaryKey = this.whoisResourcesService.getPrimaryKey(resp);
                this.messageStoreService.add(primaryKey, resp);
                this.router.navigateByUrl(`webupdates/display/${this.source}/${this.MNT_TYPE}/${primaryKey}?method=Create`);
            },
            error: (error: any) => {
                this.submitInProgress = false;
                this.alertsService.addGlobalError(`Creation of ${this.MNT_TYPE} failed, please see below for more details`);
                this.alertsService.populateFieldSpecificErrors(this.MNT_TYPE, this.maintainerAttributes, error.data);
                this.alertsService.setErrors(error.data);
                this.errorReporterService.log('Create', this.MNT_TYPE, this.alertsService.alerts.errors, this.maintainerAttributes);
            },
        });
    }

    private populateMissingAttributes() {
        this.maintainerAttributes = this.whoisResourcesService.validateAttributes(this.maintainerAttributes);

        const mntner = this.whoisResourcesService.getSingleAttributeOnName(this.maintainerAttributes, this.MNT_TYPE);
        this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes, 'mnt-by', mntner.value);
    }
}
