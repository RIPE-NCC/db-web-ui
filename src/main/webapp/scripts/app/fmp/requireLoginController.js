'use strict';

angular.module('fmp')
    .controller('RequireLoginCtrl', ['$scope', '$location', 'LOGIN_URL',
        function ($scope, $location, LOGIN_URL) {
            var returnUrl = $location.absUrl().split('#')[0] + '#/fmp/';
            $scope.loginUrl = LOGIN_URL + '?originalUrl=' + encodeURIComponent(returnUrl);
        }]);
