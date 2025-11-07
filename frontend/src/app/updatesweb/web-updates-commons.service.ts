import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { IMaintainers } from './create-modify.component';
import { MntnerService } from './mntner.service';
import { ModalAuthenticationSSOPrefilledComponent } from './modal-authentication-sso-prefilled.component';
import { ModalAuthenticationComponent } from './modal-authentication.component';

export interface IAuthParams {
    maintainers: IMaintainers;
    object: {
        name: string;
        source: string;
        type: string;
    };
    isLirObject?: boolean;
    successClbk?: (result: any) => void;
    failureClbk?: () => void;
    operation: string;
}

@Injectable({ providedIn: 'root' })
export class WebUpdatesCommonsService {
    private router = inject(Router);
    private alertService = inject(AlertsService);
    private mntnerService = inject(MntnerService);
    private modalService = inject(NgbModal);
    properties = inject(PropertiesService);

    public enableNonAuthUpdates: boolean;

    constructor() {
        const properties = this.properties;

        this.enableNonAuthUpdates =
            !properties.isProdEnv() && // Security property, this should never be enabled in PROD
            properties.NO_PASSWORD_AUTH_POPUP;
    }

    public performAuthentication(authParams: IAuthParams) {
        console.debug('Perform authentication', authParams.maintainers);
        const mntnersWithPasswords = this.mntnerService.getMntnersForAuthentication(
            authParams.maintainers.sso,
            authParams.maintainers.objectOriginal,
            authParams.maintainers.object,
        );
        const mntnersWithoutPasswords = this.mntnerService.getMntnersNotEligibleForPasswordAuthentication(
            authParams.maintainers.sso,
            authParams.maintainers.objectOriginal,
            authParams.maintainers.object,
        );
        const allowForcedDelete = !_.find(authParams.maintainers.object, (o: any) => {
            return this.mntnerService.isAnyNccMntner(o.key);
        });

        const modalRef = this.modalService.open(this.enableNonAuthUpdates ? ModalAuthenticationSSOPrefilledComponent : ModalAuthenticationComponent);

        modalRef.componentInstance.resolve = {
            method: null,
            objectType: authParams.object.type,
            objectName: authParams.object.name,
            mntners: mntnersWithPasswords,
            mntnersWithoutPassword: mntnersWithoutPasswords,
            allowForcedDelete: !!allowForcedDelete,
            isLirObject: !!authParams.isLirObject,
            source: authParams.object.source,
        };
        modalRef.closed.subscribe((result) => {
            this.alertService.clearAlertMessages();
            const selectedMntner = result.$value.selectedItem;
            console.debug('selected mntner:', selectedMntner);
            const associationResp = result.$value.response;
            console.debug('associationResp:', associationResp);
            if (this.mntnerService.isMine(selectedMntner)) {
                // has been successfully associated in authentication modal
                authParams.maintainers.sso.push(selectedMntner);
                // mark starred in selected
                authParams.maintainers.object = this.mntnerService.enrichWithMine(authParams.maintainers.sso, authParams.maintainers.object);
            }
            console.debug('After auth: maintainers.sso:', authParams.maintainers.sso);
            console.debug('After auth: maintainers.object:', authParams.maintainers.object);
            if (_.isFunction(authParams.successClbk)) {
                authParams.successClbk(associationResp);
            }
        });
        modalRef.dismissed.subscribe((failResponse) => {
            if (failResponse !== 'forceDelete' && _.isFunction(authParams.failureClbk)) {
                authParams.failureClbk();
            }
        });
    }

    public addLinkToReferenceAttributes(attributes: IAttributeModel[], objectSource: string) {
        const parser = document.createElement('a');
        return _.map(attributes, (attribute: any) => {
            if (!_.isUndefined(attribute.link)) {
                attribute.link.href = this._displayUrl(parser, attribute, objectSource);
            }
            return attribute;
        });
    }

    public navigateToDisplay(objectSource: string, objectType: string, objectName: string, operation: string) {
        if (operation) {
            this.router.navigateByUrl(`webupdates/display/${objectSource}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
        } else {
            // operation create or modify was canceled
            this.router.navigateByUrl(`webupdates/display/${objectSource}/${objectType}/${encodeURIComponent(objectName)}`);
        }
    }

    public navigateToEdit(objectSource: string, objectType: string, objectName: string, operation: string) {
        this.router.navigateByUrl(`webupdates/modify/${objectSource}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
    }

    public navigateToDelete(objectSource: string, objectType: string, objectName: string, onCancel: string) {
        this.router.navigateByUrl(`webupdates/delete/${objectSource}/${objectType}/${encodeURIComponent(objectName)}?onCancel=${onCancel}`);
    }

    private _displayUrl(parser: any, attribute: IAttributeModel, objectSource: string) {
        parser.href = attribute.link.href;
        const parts = parser.pathname.split('/');
        return `webupdates/display/${this.properties.SOURCE}/${attribute['referenced-type']}/${_.last(parts)}`;
    }
}
