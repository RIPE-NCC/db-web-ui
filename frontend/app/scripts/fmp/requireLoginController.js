/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').controller('RequireLoginCtrl', ['$scope', '$location', 'Properties',
        
        function ($scope, $location, Properties) {
            var returnUrl = $location.absUrl().split('#')[0] + '#/fmp/';
            $scope.loginUrl = Properties.LOGIN_URL + '?originalUrl=' + encodeURIComponent(returnUrl);
        }]);
    
})();
