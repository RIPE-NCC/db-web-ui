import { NgFor } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AlertsService } from '../../shared/alert/alerts.service';
import { WhoisResourcesService } from '../../shared/whois-resources.service';
import { IMntByModel } from '../../shared/whois-response-type.model';
import { IMaintainers } from '../create-modify.component';
import { MntnerService } from '../mntner.service';
import { RestService } from '../rest.service';
import { IAuthParams, WebUpdatesCommonsService } from '../web-updates-commons.service';
import { STATE } from '../web-updates-state.constants';

interface IObjectFromParameters {
    attributes: any;
    name: string;
    source: string;
    type: string;
}

@Component({
    selector: 'force-delete',
    templateUrl: './force-delete.component.html',
    imports: [NgFor, MatButton],
})
export class ForceDeleteComponent implements OnInit {
    private whoisResourcesService = inject(WhoisResourcesService);
    private webUpdatesCommonsService = inject(WebUpdatesCommonsService);
    private restService = inject(RestService);
    private mntnerService = inject(MntnerService);
    alertsService = inject(AlertsService);
    private activatedRoute = inject(ActivatedRoute);

    public object: IObjectFromParameters = {
        attributes: [],
        name: '',
        source: '',
        type: '',
    };
    public maintainers: IMaintainers = {
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public restCallInProgress: boolean = false;

    public ngOnInit() {
        this.alertsService.clearAlertMessages();

        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.object.name = this.getNameFromUrl();
        this.object.source = paramMap.get('source');
        this.object.type = paramMap.get('objectType');

        console.debug('ForceDeleteComponent: Url params: source:' + this.object.source + '. type:' + this.object.type + ', name: ' + this.object.name);

        const hasError = this.validateParamsAndShowErrors();
        if (hasError === false) {
            this.fetchDataForForceDelete();
        }
    }

    public isFormValid(): boolean {
        return !this.alertsService.hasErrors();
    }

    private getNameFromUrl(): string {
        if (this.activatedRoute.snapshot.paramMap.has('objectName')) {
            return decodeURIComponent(this.activatedRoute.snapshot.paramMap.get('objectName'));
        }
    }

    private validateParamsAndShowErrors() {
        let hasError = false;
        const forceDeletableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

        if (!_.includes(forceDeletableObjectTypes, this.object.type)) {
            const typesString = _.reduce(forceDeletableObjectTypes, (str, n) => {
                return str + ', ' + n;
            });

            this.alertsService.setGlobalError('Only ' + typesString + ' object types are force-deletable');
            hasError = true;
        }

        if (_.isUndefined(this.object.source)) {
            this.alertsService.setGlobalError('Source is missing');
            hasError = true;
        }

        if (_.isUndefined(this.object.name)) {
            this.alertsService.setGlobalError('Object key is missing');
            hasError = true;
        }

        return hasError;
    }

    private fetchDataForForceDelete() {
        // wait until all three have completed
        this.restCallInProgress = true;
        const objectToModify = this.restService.fetchObject(this.object.source, this.object.type, this.object.name);
        const ssoMntners = this.restService.fetchMntnersForSSOAccount();
        forkJoin([objectToModify, ssoMntners]).subscribe({
            next: (response) => {
                const objectToModifyResponse = response[0];
                const ssoMntnersResponse = response[1];
                this.restCallInProgress = false;

                // store object to modify
                console.debug('object to modify:' + JSON.stringify(objectToModifyResponse));
                this.wrapAndEnrichResources(this.object.type, objectToModifyResponse);

                // store mntners for SSO account
                this.maintainers.sso = ssoMntnersResponse;
                console.debug('maintainers.sso:' + JSON.stringify(this.maintainers.sso));

                this.useDryRunDeleteToDetectAuthCandidates().subscribe({
                    next: (authCandidates: any) => {
                        const objectMntners = _.map(authCandidates, (item) => {
                            return {
                                key: item,
                                type: 'mntner',
                            };
                        });

                        // fetch details of all selected maintainers concurrently
                        this.restCallInProgress = true;
                        this.restService.detailsForMntners(objectMntners).subscribe({
                            next: (enrichedMntners: IMntByModel[]) => {
                                this.restCallInProgress = false;

                                this.maintainers.object = enrichedMntners;
                                console.debug('maintainers.object:' + JSON.stringify(this.maintainers.object));
                            },
                            error: (error: any) => {
                                this.restCallInProgress = false;
                                console.error('Error fetching mntner details' + JSON.stringify(error));
                                this.alertsService.setGlobalError('Error fetching maintainer details');
                            },
                        });
                    },
                    error: (errorMsg: any) => {
                        this.alertsService.setGlobalError(errorMsg);
                    },
                });
            },
            error: (error) => {
                this.restCallInProgress = false;
                if (error && error.data) {
                    console.error('Error fetching object:' + JSON.stringify(error));
                    const whoisResources = this.wrapAndEnrichResources(error.objectType, error.data);
                    this.alertsService.setErrors(whoisResources);
                } else {
                    console.error('Error fetching mntner information:' + JSON.stringify(error));
                    this.alertsService.setGlobalError('Error fetching maintainers to force delete this object');
                }
            },
        });
    }

    private useDryRunDeleteToDetectAuthCandidates() {
        this.restCallInProgress = true;
        return this.restService.deleteObject(this.object.source, this.object.type, this.object.name, 'dry-run', false, undefined, true).pipe(
            mergeMap(() => {
                this.restCallInProgress = false;
                console.debug('auth can be performed without interactive popup');
                return [];
            }),
            catchError((error: any) => {
                this.restCallInProgress = false;
                // we expect an error: from the error we except auth candidates
                if (this.whoisResourcesService.getRequiresAdminRightFromError(error.data)) {
                    return throwError(() => 'Deleting this object requires administrative authorisation');
                } else {
                    // strip RIPE-NCC- mntners
                    let authCandidates = this.whoisResourcesService.getAuthenticationCandidatesFromError(error.data);
                    authCandidates = _.filter(authCandidates, (mntner: string) => !_.startsWith(mntner, 'RIPE-NCC-'));
                    return of(_.map(authCandidates, (item: string) => _.trim(item)));
                }
            }),
        );
    }

    private wrapAndEnrichResources(objectType: string, resp: any) {
        const whoisResources = this.whoisResourcesService.validateWhoisResources(resp);
        if (whoisResources) {
            this.object.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(objectType, this.whoisResourcesService.getAttributes(whoisResources));
        }
        return whoisResources;
    }

    public cancel() {
        this.webUpdatesCommonsService.navigateToDisplay(this.object.source, this.object.type, this.object.name, undefined);
    }

    public forceDelete() {
        if (this.isFormValid()) {
            if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, [], this.maintainers.object)) {
                console.debug('Need auth');
                this.performAuthentication();
            } else {
                console.debug('No auth needed');
                this.onSuccessfulAuthentication();
            }
        }
    }

    private performAuthentication() {
        const authParams: IAuthParams = {
            failureClbk: this.cancel,
            maintainers: this.maintainers,
            object: {
                name: this.object.name,
                source: this.object.source,
                type: this.object.type,
            },
            operation: 'ForceDelete',
            successClbk: this.onSuccessfulAuthentication,
        };
        this.webUpdatesCommonsService.performAuthentication(authParams);
    }

    private onSuccessfulAuthentication = () => {
        console.debug('Navigate to force delete screen');
        this.webUpdatesCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, STATE.FORCE_DELETE);
    };
}
