angular.module('dbWebApp')
    .directive('alerts', function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/app/directives/alertsDirective.html'
        };
    });
