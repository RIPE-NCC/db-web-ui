import {Component} from "@angular/core";
import {AlertsService} from "./alerts.service";
import {IAttributeModel, IWhoisResponseModel} from "../whois-response-type.model";

@Component({
    selector: "alerts",
    templateUrl: "./alerts.component.html",
})
export class AlertsComponent {

    constructor(public alertsService: AlertsService) {}

    public clearErrors() {
        this.alertsService.clearErrors();
    }

    public getErrors() {
        return this.alertsService.errors;
    }

    public getWarnings() {
        return this.alertsService.warnings;
    }

    public getInfos() {
        return this.alertsService.infos;
    }

    public hasErrors() {
        return this.alertsService.hasErrors();
    }

    public hasWarnings() {
        return this.alertsService.hasWarnings();
    }

    public hasInfos() {
        return this.alertsService.hasInfos();
    }

    public hasSuccesses() {
        return this.alertsService.hasSuccesses();
    }

    public setErrors(whoisResources: IWhoisResponseModel) {
        this.alertsService.setErrors(whoisResources);
    }

    public setGlobalError(errorMsg: string) {
        this.alertsService.setGlobalError(errorMsg);
    }

    public setGlobalInfo(infoMsg: string) {
        this.alertsService.setGlobalInfo(infoMsg);
    }

    public setAllErrors(whoisResources: IWhoisResponseModel) {
        this.alertsService.setAllErrors(whoisResources);
    }
    public addErrors(whoisResources: IWhoisResponseModel) {
        this.alertsService.addErrors(whoisResources);
    }

    public addGlobalError(errorMsg: string) {
        this.alertsService.addGlobalError(errorMsg);
    }

    public addGlobalWarning(warningMsg: string) {
        this.alertsService.addGlobalWarning(warningMsg);
    }

    public addGlobalSuccesses(successMsg: string) {
        this.alertsService.setGlobalSuccess(successMsg);
    }

    public addGlobalInfo(infoMsg: string) {
        this.alertsService.addGlobalInfo(infoMsg);
    }

    public populateFieldSpecificErrors(objectType: string, attrs: IAttributeModel[], whoisResources: IWhoisResponseModel) {
        return this.alertsService.populateFieldSpecificErrors(objectType, attrs, whoisResources);
    }
}
