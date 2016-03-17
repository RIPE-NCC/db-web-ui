angular.module('dbWebApp')
    .directive('alerts', function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/app/alertsDirective.html'
        };
    });
