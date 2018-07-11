// TODO replace any with concrete type
// TODO don't use rootScope but declare errors, warnings in AlertService and use it in AlertDirective
// for this purpose AlertDirective should be converted into AlertControler
class AlertService {

    public static $inject = ["$log", "$rootScope"];

    constructor(private $log: angular.ILogService, private $rootScope: any) {
        $rootScope.errors = [];
        $rootScope.warnings = [];
        $rootScope.infos = [];
        $rootScope.hasErrors = () => $rootScope.errors.length > 0;

        $rootScope.hasWarnings = () => $rootScope.warnings.length > 0;

        $rootScope.hasInfos = () => $rootScope.infos.length > 0;
    }

    public clearErrors() {
        this.$rootScope.errors = [];
        this.$rootScope.warnings = [];
        this.$rootScope.infos = [];
    }

    public hasErrors() {
        return this.$rootScope.errors.length > 0;
    }

    public getErrors() {
        return this.$rootScope.errors;
    }

    public getWarnings() {
        return this.$rootScope.warnings;
    }

    public getInfos() {
        return this.$rootScope.infos;
    }

    // TODO change to WhoisResources after converting js to ts
    public setErrors(whoisResources: any) {
        this.$rootScope.errors = whoisResources.getGlobalErrors();
        this.$rootScope.warnings = whoisResources.getGlobalWarnings();
        this.$rootScope.infos = whoisResources.getGlobalInfos();
    }

    public setAllErrors(whoisResources: any) {
        this.$rootScope.errors = whoisResources.getAllErrors();
        this.$rootScope.warnings = whoisResources.getAllWarnings();
        this.$rootScope.infos = whoisResources.getAllInfos();
    }

    public addErrors(whoisResources: any) {
        if (_.isUndefined(whoisResources)) {
            this.$log.error("alertService.addErrors: undefined input");
        } else {
            this.$rootScope.errors = this.$rootScope.errors.concat(whoisResources.getGlobalErrors());
            this.$rootScope.warnings = this.$rootScope.warnings.concat(whoisResources.getGlobalWarnings());
            this.$rootScope.infos = this.$rootScope.infos.concat(whoisResources.getGlobalInfos());
        }
    }

    public setGlobalError(errorMsg: any) {
        this.clearErrors();
        this.$rootScope.errors.push({plainText: errorMsg});
    }

    public addGlobalWarning(errorMsg: any) {
        this.$rootScope.warnings.push({plainText: errorMsg});
    }

    public addGlobalError(errorMsg: any) {
        this.$rootScope.errors.push({plainText: errorMsg});
    }

    public setGlobalInfo(errorMsg: any) {
        this.clearErrors();
        this.$rootScope.infos.push({plainText: errorMsg});
    }

    public setGlobalErrors(errorMsgs: any) {
        this.$rootScope.errors = errorMsgs;
    }

    public setGlobalWarnings(warningMsgs: any) {
        this.$rootScope.warnings = warningMsgs;
    }

    public setGlobalInfos(infoMsgs: any) {
        this.$rootScope.infos = infoMsgs;
    }

    public addGlobalInfo(errorMsg: any) {
        this.$rootScope.infos.push({plainText: errorMsg});
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

        this.$rootScope.errors = error.getGlobalErrors();
        this.$rootScope.warnings = error.getGlobalWarnings();
        this.$rootScope.infos = error.getGlobalInfos();
    }
}

angular.module("dbWebApp").service("AlertService", AlertService);
