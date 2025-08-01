import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel, IMntByModel } from '../shared/whois-response-type.model';
import { MntnerService } from '../updatesweb/mntner.service';
import { ModalAuthenticationSSOPrefilledComponent } from '../updatesweb/modal-authentication-sso-prefilled.component';
import { ModalAuthenticationComponent } from '../updatesweb/modal-authentication.component';
import { ObjectUtilService } from '../updatesweb/object-util.service';

@Injectable()
export class TextCommonsService {
    public enableNonAuthUpdates: boolean;

    constructor(
        private router: Router,
        private whoisResourcesService: WhoisResourcesService,
        private whoisMetaService: WhoisMetaService,
        private alertService: AlertsService,
        private mntnerService: MntnerService,
        private modalService: NgbModal,
        public properties: PropertiesService,
    ) {
        this.enableNonAuthUpdates =
            !properties.isProdEnv() && // Security property, this should never be enabled in PROD
            properties.NO_PASSWORD_AUTH_POPUP;
    }

    public enrichWithDefaults(objectSource: string, objectType: string, attributes: IAttributeModel[]) {
        // This does only add value if attribute exist
        this.whoisResourcesService.setSingleAttributeOnName(attributes, 'source', objectSource);
        this.whoisResourcesService.setSingleAttributeOnName(attributes, 'nic-hdl', 'AUTO-1');
        this.whoisResourcesService.setSingleAttributeOnName(attributes, 'organisation', 'AUTO-1');
        this.whoisResourcesService.setSingleAttributeOnName(attributes, 'org-type', 'OTHER'); // other org-types only settable with override

        // Remove unneeded optional attrs
        this.whoisResourcesService.removeAttributeWithName(attributes, 'created');
        this.whoisResourcesService.removeAttributeWithName(attributes, 'last-modified');
        this.whoisResourcesService.removeAttributeWithName(attributes, 'changed');
    }

    public validate(objectType: string, attributes: IAttributeModel[], errors?: any) {
        const unknownAttrs = _.filter(attributes, (attr) => {
            return _.isUndefined(this.whoisMetaService.findMetaAttributeOnObjectTypeAndName(objectType, attr.name));
        });
        if (!_.isEmpty(unknownAttrs)) {
            _.each(unknownAttrs, (attr) => {
                const msg = attr.name + ': Unknown attribute';
                if (_.isUndefined(errors)) {
                    this.alertService.addGlobalError(msg);
                } else {
                    errors.push({ plainText: msg });
                }
            });
            return;
        }

        let errorCount = 0;
        const mandatoryAtrs = this.whoisMetaService.getMetaAttributesOnObjectType(objectType, true);
        _.each(mandatoryAtrs, (meta) => {
            if (
                _.some(attributes, (attr: IAttributeModel) => {
                    return attr.name === meta.name;
                }) === false
            ) {
                const msg = meta.name + ': Missing mandatory attribute';
                if (_.isUndefined(errors)) {
                    this.alertService.addGlobalError(msg);
                } else {
                    errors.push({ plainText: msg });
                }
                errorCount++;
            }
        });

        const enrichedAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(objectType, attributes);
        if (!this.whoisResourcesService.validate(enrichedAttributes)) {
            _.each(enrichedAttributes, (item) => {
                if (item.$$error) {
                    // Note: keep it lower-case to be consistent with server-side error reports
                    const msg = item.name + ': ' + item.$$error;
                    if (_.isUndefined(errors)) {
                        this.alertService.addGlobalError(msg);
                    } else {
                        errors.push({ plainText: msg });
                    }
                }
            });
            errorCount++;
        }
        return errorCount === 0;
    }

    public authenticate(
        method: string,
        objectSource: string,
        objectType: string,
        objectName: string,
        ssoMaintainers: any,
        attributes: any,
        passwords: string[],
        override: string,
    ) {
        let needsAuth = false;

        if (!_.isUndefined(override)) {
            // prefer override over passwords
            if (_.isArray(passwords)) {
                passwords.length = 0; // length is writable in JS :)
            }
        } else {
            if (_.isEmpty(passwords) && _.isUndefined(override)) {
                // show password popup if needed
                const objectMntners = this._getObjectMntners(attributes);
                const originalMntners = method === 'Create' ? [] : objectMntners;
                if (this.mntnerService.needsPasswordAuthentication(ssoMaintainers, originalMntners, objectMntners)) {
                    return this.performAuthentication(
                        method,
                        objectSource,
                        objectType,
                        objectName,
                        ssoMaintainers,
                        objectMntners,
                        ObjectUtilService.isLirObject(attributes, objectType),
                    );
                }
            }
        }
        if (needsAuth === false) {
            console.debug('No authentication needed');
            return of(true);
        }
    }

    public stripEmptyAttributes(attributes: any) {
        return this.whoisResourcesService.removeNullAttributes(attributes);
    }

    public navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: string) {
        this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
    }

    public navigateToDelete(objectSource: string, objectType: string, objectName: string, onCancel: any) {
        this.router.navigateByUrl(`webupdates/delete/${objectSource}/${objectType}/${encodeURIComponent(objectName)}?onCancel=${onCancel}`);
    }

    public uncapitalize(attributes: IAttributeModel[]) {
        return this.whoisResourcesService.validateAttributes(
            _.map(attributes, (attr) => {
                attr.name = attr.name.toLowerCase();
                return attr;
            }),
        );
    }

    public capitaliseMandatory(attributes: IAttributeModel[]) {
        _.each(attributes, (attr) => {
            if (!_.isUndefined(attr.$$meta) && attr.$$meta.$$mandatory) {
                attr.name = attr.name.toUpperCase();
            }
        });
    }

    private performAuthentication(
        method: string,
        objectSource: string,
        objectType: string,
        objectName: string,
        ssoMntners: IMntByModel[],
        objectMntners: any[],
        isLirObject: boolean,
    ) {
        const object = {
            name: objectName,
            source: objectSource,
            type: objectType,
        };
        const mntnersWithPasswords = this.mntnerService.getMntnersForAuthentication(ssoMntners, [], objectMntners);
        const mntnersWithoutPasswords = this.mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
        const allowForcedDelete = !_.find(objectMntners, (o) => {
            return this.mntnerService.isAnyNccMntner(o.key);
        });
        const modalRef = this.modalService.open(this.enableNonAuthUpdates ? ModalAuthenticationSSOPrefilledComponent : ModalAuthenticationComponent);
        modalRef.componentInstance.resolve = {
            method: method,
            objectType: object.type,
            objectName: object.name,
            mntners: mntnersWithPasswords,
            mntnersWithoutPassword: mntnersWithoutPasswords,
            allowForcedDelete: !!allowForcedDelete,
            isLirObject: !!isLirObject,
            source: object.source,
        };
        return modalRef.closed.pipe(
            map((result) => {
                this.alertService.clearAlertMessages();
                const authenticatedMntner = result.$value.selectedItem;
                if (this._isMine(authenticatedMntner)) {
                    // has been successfully associated in authentication modal
                    ssoMntners.push(authenticatedMntner);
                }
                console.debug('Authentication succeeded');
                return true;
            }),
            catchError(() => {
                console.debug('Authentication failed');
                return throwError(() => false);
            }),
        );
    }

    private _isMine(mntner: IMntByModel) {
        if (!mntner.mine) {
            return false;
        } else {
            return mntner.mine;
        }
    }

    private _getObjectMntners(attributes: any) {
        return _.map(this.whoisResourcesService.getAllAttributesWithValueOnName(attributes, 'mnt-by'), (objMntner: any) => {
            // Notes:
            // - RPSL attribute values can contain leading and trailing spaces, so the must be trimmed
            // - Assume maintainers have md5-password, so prevent unmodifiable error
            return { type: 'mntner', key: _.trim(objMntner.value), auth: ['MD5-PW'] };
        });
    }
}
