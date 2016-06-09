/*global angular*/

(function () {
    'use strict';
    angular.module('dbWebApp').directive('alerts',
        
        function () {
            return {
                restrict: 'E',
                templateUrl: 'scripts/app/alertsDirective.html'
            };
        });

})();
