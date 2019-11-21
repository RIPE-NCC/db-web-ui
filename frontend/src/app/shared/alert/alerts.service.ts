import {Injectable} from "@angular/core";
import * as _ from "lodash";
import {IAttributeModel, IErrorMessageModel, IWhoisResponseModel} from "../../shared/whois-response-type.model";
import {WhoisResourcesService} from "../whois-resources.service";

@Injectable()
export class AlertsService {

    public errors: IErrorMessageModel[] = [];
    public warnings: IErrorMessageModel[] = [];
    public infos: IErrorMessageModel[] = [];

    constructor(public whoisResourcesService: WhoisResourcesService) {
        this.hasErrors();
        this.hasWarnings();
        this.hasInfos();
    }

    public clearErrors() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public hasWarnings(): boolean {
        return this.warnings.length > 0;
    }

    public hasInfos(): boolean {
        return this.infos.length > 0;
    }

    public getErrors() {
        return this.errors;
    }

    public getWarnings() {
        return this.warnings;
    }

    public getInfos() {
        return this.infos;
    }

    // TODO change to WhoisResources after converting js to ts
    public setErrors(whoisResources: IWhoisResponseModel) {
        this.errors = this.whoisResourcesService.getGlobalErrors(whoisResources);
        this.warnings = this.whoisResourcesService.getGlobalWarnings(whoisResources);
        this.infos = this.whoisResourcesService.getGlobalInfos(whoisResources);
    }

    public setAllErrors(whoisResources: IWhoisResponseModel) {
        this.errors = this.whoisResourcesService.getAllErrors(whoisResources);
        this.warnings = this.whoisResourcesService.getAllWarnings(whoisResources);
        this.infos = this.whoisResourcesService.getAllInfos(whoisResources);
    }

    public addErrors(whoisResources: IWhoisResponseModel) {
        if (_.isUndefined(whoisResources)) {
            console.error("AlertService.addErrors: undefined input");
        } else {
            this.errors = this.errors.concat(this.whoisResourcesService.getGlobalErrors(whoisResources));
            this.warnings = this.warnings.concat(this.whoisResourcesService.getGlobalWarnings(whoisResources));
            this.infos = this.infos.concat(this.whoisResourcesService.getGlobalInfos(whoisResources));
        }
    }

    public setGlobalError(errorMsg: string) {
        this.clearErrors();
        this.errors.push({plainText: errorMsg});
    }

    public addGlobalWarning(errorMsg: string) {
        this.warnings.push({plainText: errorMsg});
    }

    public addGlobalError(errorMsg: string) {
        this.errors.push({plainText: errorMsg});
    }

    public setGlobalInfo(errorMsg: string) {
        this.clearErrors();
        this.infos.push({plainText: errorMsg});
    }

    public setGlobalErrors(errorMsgs: IErrorMessageModel[]) {
        this.errors = errorMsgs;
    }

    public setGlobalWarnings(warningMsgs: IErrorMessageModel[]) {
        this.warnings = warningMsgs;
    }

    public setGlobalInfos(infoMsgs: IErrorMessageModel[]) {
        this.infos = infoMsgs;
    }

    public addGlobalInfo(errorMsg: string) {
        this.infos.push({plainText: errorMsg});
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

    public showWhoisResourceErrors(objectType: string, error: any) {
        this.errors = this.whoisResourcesService.getGlobalErrors(error);
        this.warnings = this.whoisResourcesService.getGlobalWarnings(error);
        this.infos = this.whoisResourcesService.getGlobalInfos(error);
    }
}
