import { EventEmitter, Injectable, Output } from '@angular/core';
import * as _ from 'lodash';
import { WhoisResourcesService } from '../whois-resources.service';
import { IAttributeModel, IObjectMessageModel, IWhoisResponseModel } from '../whois-response-type.model';

export interface IAlertMessageModel extends IObjectMessageModel {
    text?: string;
    linkurl?: string;
    linktext?: string;
}

export interface IAlerts {
    errors: IAlertMessageModel[];
    warnings: IAlertMessageModel[];
    infos: IAlertMessageModel[];
    successes: IAlertMessageModel[];
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
    @Output()
    public alertsChanged = new EventEmitter();

    public alerts: IAlerts = {
        errors: [],
        warnings: [],
        infos: [],
        successes: [],
    };

    constructor(public whoisResourcesService: WhoisResourcesService) {
        this.hasErrors();
        this.hasWarnings();
    }

    public clearAlertMessages() {
        this.alerts = {
            errors: [],
            warnings: [],
            infos: [],
            successes: [],
        };
        this.alertsChanged.emit(this.alerts);
    }

    public hasErrors(): boolean {
        return this.alerts.errors.length > 0;
    }

    public hasWarnings(): boolean {
        return this.alerts.warnings.length > 0;
    }

    public setErrors(whoisResources: IWhoisResponseModel) {
        this.alerts.errors = [...this.alerts.errors, ...this.whoisResourcesService.getGlobalErrors(whoisResources)];
        this.alerts.warnings = [...this.alerts.warnings, ...this.whoisResourcesService.getGlobalWarnings(whoisResources)];
        this.alerts.infos = [...this.alerts.infos, ...this.whoisResourcesService.getGlobalInfos(whoisResources)];
        this.alertsChanged.emit(this.alerts);
    }

    public setAllErrors(whoisResources: IWhoisResponseModel) {
        this.alerts.errors = this.whoisResourcesService.getAllErrors(whoisResources);
        this.filterOutError101();
        this.alerts.warnings = this.whoisResourcesService.getAllWarnings(whoisResources);
        this.alerts.infos = this.whoisResourcesService.getAllInfos(whoisResources);
        this.alertsChanged.emit(this.alerts);
    }

    private filterOutError101() {
        this.alerts.errors = this.alerts.errors.filter((error) => !error.text.toUpperCase().includes('ERROR:101'));
    }

    public addAlertMsgs(whoisResources: IWhoisResponseModel) {
        if (_.isUndefined(whoisResources)) {
            console.error('AlertService.addAlertMsgs: undefined input');
        } else {
            this.alerts.errors = this.alerts.errors.concat(this.whoisResourcesService.getGlobalErrors(whoisResources));
            this.alerts.warnings = this.alerts.warnings.concat(this.whoisResourcesService.getGlobalWarnings(whoisResources));
            this.alerts.infos = this.alerts.infos.concat(this.whoisResourcesService.getGlobalInfos(whoisResources));
            this.alertsChanged.emit(this.alerts);
        }
    }

    public setGlobalError(errorMsg: string, buttonUrl?: string, buttonText?: string) {
        this.clearAlertMessages();
        const error = buttonUrl ? { plainText: errorMsg, linkurl: buttonUrl, linktext: buttonText } : { plainText: errorMsg };
        this.alerts.errors.push(error);
        this.alertsChanged.emit(this.alerts);
    }

    public setGlobalWarning(warningMsg: string, buttonUrl?: string, buttonText?: string) {
        const warning = buttonUrl ? { plainText: warningMsg, linkurl: buttonUrl, linktext: buttonText } : { plainText: warningMsg };
        this.alerts.warnings.push(warning);
        this.alertsChanged.emit(this.alerts);
    }

    public setGlobalInfo(infoMsg: string) {
        this.alerts.infos.push({ plainText: infoMsg });
        this.alertsChanged.emit(this.alerts);
    }

    public setGlobalSuccess(successMsg: string, buttonUrl?: string, buttonText?: string) {
        this.clearAlertMessages();
        const success = buttonUrl ? { plainText: successMsg, linkurl: buttonUrl, linktext: buttonText } : { plainText: successMsg };
        this.alerts.successes.push(success);
        this.alertsChanged.emit(this.alerts);
    }

    public addGlobalError(errorMsg: string) {
        this.alerts.errors.push({ plainText: errorMsg });
        this.alertsChanged.emit(this.alerts);
    }

    public addGlobalWarning(warningMsg: string, buttonUrl?: string, buttonText?: string) {
        const warning = buttonUrl ? { plainText: warningMsg, linkurl: buttonUrl, linktext: buttonText } : { plainText: warningMsg };
        this.alerts.warnings.push(warning);
        this.alertsChanged.emit(this.alerts);
    }

    public addGlobalInfo(infoMsg: string, buttonUrl?: string, buttonText?: string) {
        const info = buttonUrl ? { plainText: infoMsg, linkurl: buttonUrl, linktext: buttonText } : { plainText: infoMsg };
        this.alerts.infos.push(info);
        this.alertsChanged.emit(this.alerts);
    }

    public addGlobalSuccesses(successMsg: string) {
        this.alerts.successes.push({ plainText: successMsg });
        this.alertsChanged.emit(this.alerts);
    }

    public populateFieldSpecificErrors(objectType: string, attrs: IAttributeModel[], whoisResources: IWhoisResponseModel) {
        let firstAttrError: string;
        _.each(attrs, (attr: IAttributeModel) => {
            // keep existing error messages
            if (!attr.$$error) {
                const errors = this.whoisResourcesService.getErrorsOnAttribute(whoisResources, attr.name, attr.value);
                if (errors && errors.length > 0) {
                    attr.$$error = errors[0].plainText;
                    if (!firstAttrError) {
                        firstAttrError = attr.name;
                    }
                }
            }
        });
        return firstAttrError;
    }
}
