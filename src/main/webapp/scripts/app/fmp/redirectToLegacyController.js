'use strict';

angular.module('fmp')
    .controller('RedirectToLegacyCtrl', function ($routeParams, $window) {
        var url = '/change-auth/authentication.html?mntnerKey=';

        if ($routeParams.hasOwnProperty('maintainerKey')) {
            $window.location.href = url + $routeParams.maintainerKey;
        } else {
            $window.location.href = url;
        }
    });
