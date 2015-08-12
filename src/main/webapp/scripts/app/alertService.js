angular.module('dbWebApp')
    .factory('AlertService', function ($rootScope) {
        var alertService = {};

        $rootScope.errors = [];
        $rootScope.warnings = [];
        $rootScope.infos = [];

        $rootScope.hasErrors = alertService.hasErrors;
        $rootScope.hasWarnings = alertService.hasWarnings;
        $rootScope.hasInfos = alertService.hasInfos;


        alertService.hasErrors = function () {
            return $rootScope.errors.length > 0;
        }

        alertService.hasWarnings = function () {
            return $rootScope.warnings.length > 0;
        }

        alertService.hasInfos = function () {
            return $rootScope.infos.length > 0;
        }

        alertService.clearErrors = function () {
            $rootScope.errors = [];
            $rootScope.warnings = [];
        }

        alertService.setErrors = function (whoisResources) {

            $rootScope.errors = whoisResources.getGlobalErrors();
            $rootScope.warnings = whoisResources.getGlobalWarnings();
            $rootScope.infos = whoisResources.getGlobalInfos();
        }

        alertService.setGlobalError = function( errorMsg ) {
            alertService.clearErrors();
            $rootScope.errors.push({plainText:errorMsg});
        }

        return alertService;
});
