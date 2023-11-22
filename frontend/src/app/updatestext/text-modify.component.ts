import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { AlertsService } from '../shared/alert/alerts.service';
import { CredentialsService } from '../shared/credentials.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { ErrorReporterService } from '../updatesweb/error-reporter.service';
import { MessageStoreService } from '../updatesweb/message-store.service';
import { PreferenceService } from '../updatesweb/preference.service';
import { RestService } from '../updatesweb/rest.service';
import { RpslService } from './rpsl.service';
import { TextCommonsService } from './text-commons.service';
import { ITextObject } from './text-create.component';

@Component({
    selector: 'text-modify',
    templateUrl: './text-modify.component.html',
})
export class TextModifyComponent implements OnInit {
    public restCallInProgress: boolean = false;
    public noRedirect: boolean = false;
    public object: ITextObject = {
        source: '',
        type: '',
    };
    public mntners: any;
    public name: string;
    public override: string;
    public passwords: string[] = [];
    public deletable: boolean;

    constructor(
        private whoisResourcesService: WhoisResourcesService,
        private restService: RestService,
        private errorReporterService: ErrorReporterService,
        private messageStoreService: MessageStoreService,
        private rpslService: RpslService,
        private textCommonsService: TextCommonsService,
        private credentialsService: CredentialsService,
        private preferenceService: PreferenceService,
        public alertsServices: AlertsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {}

    public ngOnInit() {
        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.object.source = paramMap.get('source');
        this.object.type = paramMap.get('objectType');
        this.object.name = decodeURIComponent(paramMap.get('objectName'));
        if (queryParamMap.has('rpsl')) {
            this.object.rpsl = decodeURIComponent(queryParamMap.get('rpsl'));
        }
        const redirect = !queryParamMap.has('noRedirect');

        this.mntners = {};
        this.mntners.sso = [];

        console.debug(
            'TextModifyController: Url params:' +
                ' object.source:' +
                this.object.source +
                ', object.type:' +
                this.object.type +
                ', object.name:' +
                this.object.name +
                ', noRedirect:' +
                this.noRedirect,
        );

        if (this.preferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }

        if (_.isUndefined(this.object.rpsl)) {
            this.fetchAndPopulateObject();
        }
    }

    public submit() {
        const objects = this.rpslService.fromRpsl(this.object.rpsl);
        if (objects.length > 1) {
            this.alertsServices.setGlobalError('Only a single object is allowed');
            return;
        }

        this.passwords = objects[0].passwords;
        this.override = objects[0].override;
        let attributes = this.textCommonsService.uncapitalize(objects[0].attributes);

        console.debug('attributes:' + JSON.stringify(attributes));
        if (!this.textCommonsService.validate(this.object.type, attributes)) {
            return;
        }

        if (this.credentialsService.hasCredentials()) {
            // todo: prevent duplicate password
            this.passwords.push(...this.credentialsService.getPasswordsForRestCall());
        }

        this.textCommonsService
            .authenticate('Modify', this.object.source, this.object.type, this.object.name, this.mntners.sso, attributes, this.passwords, this.override)
            .subscribe({
                next: () => {
                    console.info('Successfully authenticated');

                    // combine all passwords
                    const combinedPasswords = _.union(this.passwords, this.credentialsService.getPasswordsForRestCall());

                    attributes = this.textCommonsService.stripEmptyAttributes(attributes);

                    this.restCallInProgress = true;
                    this.restService
                        .modifyObject(
                            this.object.source,
                            this.object.type,
                            this.object.name,
                            this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes),
                            combinedPasswords,
                            this.override,
                            true,
                        )
                        .subscribe({
                            next: (whoisResources: any) => {
                                this.restCallInProgress = false;
                                const primaryKey = this.whoisResourcesService.getPrimaryKey(whoisResources);
                                this.messageStoreService.add(primaryKey, whoisResources);
                                this.navigateToDisplayPage(this.object.source, this.object.type, primaryKey, 'Modify');
                            },
                            error: (errorWhoisResources: any) => {
                                this.restCallInProgress = false;

                                const whoisResources = errorWhoisResources.data;
                                this.alertsServices.setAllErrors(whoisResources);
                                const attributes = this.whoisResourcesService.getAttributes(whoisResources);
                                if (!_.isEmpty(attributes)) {
                                    this.errorReporterService.log('TextModify', this.object.type, this.alertsServices.alerts.errors, attributes);
                                }
                            },
                        });
                },
                error: () => {
                    console.error('Error authenticating');
                },
            });
    }

    public switchToWebMode() {
        console.debug('Switching to web-mode');

        this.preferenceService.setWebMode();

        this.router.navigateByUrl(`webupdates/modify/${this.object.source}/${this.object.type}/${encodeURIComponent(this.object.name)}?noRedirect`);
    }

    public cancel() {
        if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
            this.navigateToDisplayPage(this.object.source, this.object.type, this.object.name, undefined);
        }
    }

    public deleteObject() {
        this.textCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, 'textupdates/modify');
    }

    private fetchAndPopulateObject() {
        // see if we have a password from a previous session
        if (this.credentialsService.hasCredentials()) {
            console.debug('Found password in CredentialsService for fetch');
            this.passwords.push(...this.credentialsService.getPasswordsForRestCall());
        }
        this.restCallInProgress = true;
        const mntners = this.restService.fetchMntnersForSSOAccount();
        const objectToModify = this.restService.fetchObject(this.object.source, this.object.type, this.object.name, this.passwords, true);
        forkJoin([mntners, objectToModify]).subscribe({
            next: (response) => {
                const mntnersResponse = response[0];
                const objectToModifyResponse = response[1];
                this.restCallInProgress = false;
                const attributes = this.handleFetchResponse(objectToModifyResponse);
                this.deletable = this.whoisResourcesService.canDeleteObject(this.object.type, attributes);
                // store mntners for SSO account
                this.mntners.sso = mntnersResponse;

                this.textCommonsService
                    .authenticate('Modify', this.object.source, this.object.type, this.object.name, this.mntners.sso, attributes, this.passwords, this.override)
                    .subscribe({
                        next: () => {
                            console.debug('Successfully authenticated');
                            this.refreshObjectIfNeeded(this.object.source, this.object.type, this.object.name);
                        },
                        error: () => {
                            console.error('Error authenticating');
                        },
                    });
            },
            error: (error) => {
                this.restCallInProgress = false;
                if (error.data) {
                    this.alertsServices.setErrors(error.data);
                } else {
                    this.alertsServices.setGlobalError('Error fetching maintainers associated with this SSO account');
                }
            },
        });
    }

    private handleFetchResponse(objectToModify: any) {
        console.debug('[textModifyController] object to modify: ' + JSON.stringify(objectToModify));
        // Extract attributes from response
        const attributes = this.whoisResourcesService.getAttributes(objectToModify);

        // Needed by display screen
        this.messageStoreService.add('DIFF', _.cloneDeep(attributes));

        // prevent created and last-modfied to be in
        this.whoisResourcesService.removeAttributeWithName(attributes, 'created');
        this.whoisResourcesService.removeAttributeWithName(attributes, 'last-modified');

        const obj = {
            attributes,
            override: this.override,
            passwords: this.passwords,
        };
        this.object.rpsl = this.rpslService.toRpsl(obj);
        console.debug('RPSL:' + this.object.rpsl);

        return attributes;
    }

    private navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: any) {
        if (operation) {
            this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
        } else {
            // operation create or modify was canceled
            this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}`);
        }
    }

    private refreshObjectIfNeeded(objectSource: string, objectType: string, objectName: string) {
        console.debug('refreshObjectIfNeeded:' + objectType);
        if (objectType === 'mntner') {
            let password = null;
            if (this.credentialsService.hasCredentials()) {
                password = this.credentialsService.getPasswordsForRestCall();
            }

            this.restCallInProgress = true;
            this.restService.fetchObject(objectSource, objectType, objectName, password, true).subscribe({
                next: (result: any) => {
                    this.restCallInProgress = false;
                    this.handleFetchResponse(result);
                },
                error: () => {
                    this.restCallInProgress = false;
                },
            });
        }
    }
}
