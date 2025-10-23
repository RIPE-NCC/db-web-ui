import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import * as _ from 'lodash';
import { union } from 'lodash';
import { forkJoin } from 'rxjs';
import { AlertsService } from '../shared/alert/alerts.service';
import { CredentialsService } from '../shared/credentials.service';
import { SubmittingAgreementComponent } from '../shared/submitting-agreement.component';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { RpslService } from '../updatestext/rpsl.service';
import { TextCommonsService } from '../updatestext/text-commons.service';
import { IMaintainers } from '../updatesweb/create-modify.component';
import { MessageStoreService } from '../updatesweb/message-store.service';
import { RestService } from '../updatesweb/rest.service';
import { ScreenLogicInterceptorService } from '../updatesweb/screen-logic-interceptor.service';

@Component({
    selector: 'whois-object-text-editor',
    templateUrl: './whois-object-text-editor.component.html',
    imports: [FormsModule, NgIf, SubmittingAgreementComponent, MatButton],
})
export class WhoisObjectTextEditorComponent implements OnInit {
    @Input()
    type: string;
    @Input()
    source: string;
    @Input()
    objectName: string;
    @Input()
    rpsl?: string;

    @Output()
    submitEvent: EventEmitter<any> = new EventEmitter();
    @Output()
    cancelEvent: EventEmitter<void> = new EventEmitter();
    @Output()
    deleteEvent: EventEmitter<void> = new EventEmitter();

    public restCallInProgress: boolean = false;
    public noRedirect: boolean = false;

    public mntners: IMaintainers = {
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public override: string;
    public deletable: boolean;
    public passwords: string[] = [];
    public haveNonLatin1: boolean;

    constructor(
        private whoisResourcesService: WhoisResourcesService,
        private restService: RestService,
        private messageStoreService: MessageStoreService,
        private rpslService: RpslService,
        private textCommonsService: TextCommonsService,
        private credentialsService: CredentialsService,
        public alertsServices: AlertsService,
    ) {}

    public ngOnInit() {
        if (_.isUndefined(this.rpsl)) {
            this.fetchAndPopulateObject();
        }
    }

    public submit() {
        const objects = this.rpslService.fromRpsl(this.rpsl);
        if (objects.length > 1) {
            this.alertsServices.setGlobalError('Only a single object is allowed');
            return;
        }

        const passwords = objects[0].passwords;
        const override = objects[0].override;
        let attributes = this.textCommonsService.uncapitalize(objects[0].attributes);

        console.debug('attributes:' + JSON.stringify(attributes));
        if (!this.textCommonsService.validate(this.type, attributes)) {
            return;
        }

        if (this.credentialsService.hasCredentials()) {
            // todo: prevent duplicate password
            passwords.push(...this.credentialsService.getPasswordsForRestCall());
        }

        this.textCommonsService.authenticate('Modify', this.source, this.type, this.objectName, this.mntners.sso, attributes, passwords, override).subscribe({
            next: () => {
                console.info('Successfully authenticated');

                // combine all passwords
                const combinedPasswords = union(passwords, this.credentialsService.getPasswordsForRestCall());

                attributes = this.textCommonsService.stripEmptyAttributes(attributes);

                this.restService
                    .modifyObject(
                        this.source,
                        this.type,
                        this.objectName,
                        this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes),
                        combinedPasswords,
                        override,
                        true,
                    )
                    .subscribe({
                        next: (whoisResources: any) => {
                            this.submitEvent.emit(whoisResources);
                        },
                        error: (errorWhoisResources: any) => {
                            this.submitEvent.emit(errorWhoisResources);
                        },
                    });
            },
            error: () => {
                console.error('Error authenticating');
            },
        });
    }

    public cancel() {
        if (window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
            this.cancelEvent.emit();
        }
    }

    public deleteObject() {
        this.deleteEvent.emit();
    }

    hasNonLatin1(): boolean {
        this.haveNonLatin1 = ScreenLogicInterceptorService.hasNonLatin1(this.rpsl);
        return this.haveNonLatin1;
    }

    private fetchAndPopulateObject() {
        // see if we have a password from a previous session
        if (this.credentialsService.hasCredentials()) {
            console.debug('Found password in CredentialsService for fetch');
            this.passwords.push(...this.credentialsService.getPasswordsForRestCall());
        }
        this.restCallInProgress = true;
        const mntners = this.restService.fetchMntnersForSSOAccount();
        const objectToModify = this.restService.fetchObject(this.source, this.type, this.objectName, this.passwords, true);
        forkJoin([mntners, objectToModify]).subscribe({
            next: (response) => {
                const mntnersResponse = response[0];
                const objectToModifyResponse = response[1];
                this.restCallInProgress = false;
                const attributes = this.handleFetchResponse(objectToModifyResponse);
                // store mntners for SSO account
                this.mntners.sso = mntnersResponse;
                this.deletable = this.whoisResourcesService.canDeleteObject(attributes, this.mntners.sso, this.type);
                this.textCommonsService
                    .authenticate('Modify', this.source, this.type, this.objectName, this.mntners.sso, attributes, this.passwords, this.override)
                    .subscribe({
                        next: () => {
                            console.debug('Successfully authenticated');
                            this.refreshObjectIfNeeded(this.source, this.type, this.objectName);
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
        this.rpsl = this.rpslService.toRpsl(obj);
        console.debug('RPSL:' + this.rpsl);

        return attributes;
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
