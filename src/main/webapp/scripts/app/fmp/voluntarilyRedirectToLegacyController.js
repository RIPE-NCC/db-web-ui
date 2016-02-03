'use strict';

angular.module('fmp')
    .controller('VoluntarilyRedirectToLegacyCtrl', function ($routeParams, $window) {
        var url = '/change-auth/authentication.html?mntnerKey=';

        $window.location.href = url + $routeParams.maintainerKey + '&voluntary=true';
    });

