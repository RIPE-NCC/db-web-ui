/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').controller('RedirectToLegacyCtrl',

        function ($stateParams, $window) {
            var url = '/change-auth/authentication.html?mntnerKey=';

            if ($stateParams.hasOwnProperty('maintainerKey')) {
                $window.location.href = url + $stateParams.maintainerKey;
            } else {
                $window.location.href = url;
            }
        });
})();
