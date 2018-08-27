interface IAlertMsg {
    plainText: string;
}

class AlertService {

    public static $inject = ["$log"];

    public errors: IAlertMsg[] = [];
    public warnings: IAlertMsg[] = [];
    public infos: IAlertMsg[] = [];

    constructor(private $log: angular.ILogService) {
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
    public setErrors(whoisResources: any) {
        this.errors = whoisResources.getGlobalErrors();
        this.warnings = whoisResources.getGlobalWarnings();
        this.infos = whoisResources.getGlobalInfos();
    }

    public setAllErrors(whoisResources: any) {
        this.errors = whoisResources.getAllErrors();
        this.warnings = whoisResources.getAllWarnings();
        this.infos = whoisResources.getAllInfos();
    }

    public addErrors(whoisResources: any) {
        if (_.isUndefined(whoisResources)) {
            this.$log.error("AlertService.addErrors: undefined input");
        } else {
            this.errors = this.errors.concat(whoisResources.getGlobalErrors());
            this.warnings = this.warnings.concat(whoisResources.getGlobalWarnings());
            this.infos = this.infos.concat(whoisResources.getGlobalInfos());
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

    public setGlobalErrors(errorMsgs: IAlertMsg[]) {
        this.errors = errorMsgs;
    }

    public setGlobalWarnings(warningMsgs: IAlertMsg[]) {
        this.warnings = warningMsgs;
    }

    public setGlobalInfos(infoMsgs: IAlertMsg[]) {
        this.infos = infoMsgs;
    }

    public addGlobalInfo(errorMsg: string) {
        this.infos.push({plainText: errorMsg});
    }

    public populateFieldSpecificErrors(objectType: any, attrs: any, whoisResources: any) {

        let firstAttrError = "";

        _.each(attrs, (attr) => {
            // keep existing error messages
            if (!attr.$$error) {
                const errors = whoisResources.getErrorsOnAttribute(attr.name, attr.value);
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

    public showWhoisResourceErrors(objectType: any, error: any) {

        this.errors = error.getGlobalErrors();
        this.warnings = error.getGlobalWarnings();
        this.infos = error.getGlobalInfos();
    }
}

angular.module("dbWebApp").service("AlertService", AlertService);
