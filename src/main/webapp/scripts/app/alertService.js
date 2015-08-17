angular.module('dbWebApp')
    .factory('AlertService', function ($rootScope, WhoisResources) {
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

        alertService.setErrors = function (whoisResources) {

            $rootScope.errors = whoisResources.getGlobalErrors();
            $rootScope.warnings = whoisResources.getGlobalWarnings();
            $rootScope.infos = whoisResources.getGlobalInfos();
        };

        alertService.setGlobalError = function( errorMsg ) {
            alertService.clearErrors();
            $rootScope.errors.push({plainText:errorMsg});
        };

        alertService.populateFieldSpecificErrors = function(objectType, attrs, error) {
            var whoisResources = WhoisResources.wrapWhoisResources(error);
            if (whoisResources) {
                WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
            }

            _.map(attrs, function (attr) {
                // keep existing error messages
                if (!attr.$$error) {
                    var errors = whoisResources.getErrorsOnAttribute(attr.name, attr.value);
                    if (errors && errors.length > 0) {
                        attr.$$error = errors[0].plainText;
                    }
                }
                return attr;
            });
        };

        alertService.showWhoisResourceErrors = function( objectType, error ) {
            var whoisResources = WhoisResources.wrapWhoisResources(error);
            if (whoisResources) {
                WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
            }

            $rootScope.errors = whoisResources.getGlobalErrors();
            $rootScope.warnings = whoisResources.getGlobalWarnings();
            $rootScope.infos = whoisResources.getGlobalInfos();
        };

        return alertService;
});
