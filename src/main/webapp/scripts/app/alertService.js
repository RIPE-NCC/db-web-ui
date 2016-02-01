angular.module('dbWebApp')
    .service('AlertService', ['$log', '$rootScope', 'WhoisResources', function ($log, $rootScope, WhoisResources) {
        var alertService = {};

        $rootScope.errors = [];
        $rootScope.warnings = [];
        $rootScope.infos = [];


        $rootScope.hasErrors = function () {
            return $rootScope.errors.length > 0;
        };

        $rootScope.hasWarnings = function () {
            return $rootScope.warnings.length > 0;
        };

        $rootScope.hasInfos = function () {
            return $rootScope.infos.length > 0;
        };

        alertService.clearErrors = function () {
            $rootScope.errors = [];
            $rootScope.warnings = [];
            $rootScope.infos = [];
        };

        alertService.hasErrors = function () {
            return $rootScope.errors.length > 0;
        };

        alertService.getErrors = function () {
            return $rootScope.errors;
        };

        alertService.getWarnings = function () {
            return $rootScope.warnings;
        };

        alertService.setErrors = function (whoisResources) {
            $rootScope.errors = whoisResources.getGlobalErrors();
            $rootScope.warnings = whoisResources.getGlobalWarnings();
            $rootScope.infos = whoisResources.getGlobalInfos();
        };

        alertService.setAllErrors = function (whoisResources) {
            $rootScope.errors = whoisResources.getAllErrors();
            $rootScope.warnings = whoisResources.getAllWarnings();
            $rootScope.infos = whoisResources.getAllInfos();
        };

        alertService.addErrors = function (whoisResources) {
            if(_.isUndefined(whoisResources) ) {
                $log.error('alertService.addErrors: undefined input' );
            } else {
                $rootScope.errors = $rootScope.errors.concat(whoisResources.getGlobalErrors());
                $rootScope.warnings = $rootScope.warnings.concat(whoisResources.getGlobalWarnings());
                $rootScope.infos = $rootScope.infos.concat(whoisResources.getGlobalInfos());
            }
        };

        alertService.setGlobalError = function( errorMsg ) {
            alertService.clearErrors();
            $rootScope.errors.push({plainText:errorMsg});
        };

        alertService.addGlobalError = function( errorMsg ) {
            $rootScope.errors.push({plainText:errorMsg});
        };

        alertService.setGlobalInfo = function( errorMsg ) {
            alertService.clearErrors();
            $rootScope.infos.push({plainText:errorMsg});
        };

        alertService.setGlobalErrors = function( errorMsgs ) {
            $rootScope.errors = errorMsgs;
        };

        alertService.setGlobalWarnings = function( warningMsgs ) {
            $rootScope.warnings = warningMsgs;
        };

        alertService.setGlobalInfos = function( infoMsgs ) {
            $rootScope.infos = infoMsgs;
        };

        alertService.populateFieldSpecificErrors = function(objectType, attrs, whoisResources) {

            _.each(attrs, function (attr) {
                // keep existing error messages
                if (!attr.$$error) {
                    var errors = whoisResources.getErrorsOnAttribute(attr.name, attr.value);
                    if (errors && errors.length > 0) {
                        attr.$$error = errors[0].plainText;
                    }
                }
            });
        };

        alertService.showWhoisResourceErrors = function( objectType, error ) {

            $rootScope.errors = error.getGlobalErrors();
            $rootScope.warnings = error.getGlobalWarnings();
            $rootScope.infos = error.getGlobalInfos();
        };

        return alertService;
}]);
