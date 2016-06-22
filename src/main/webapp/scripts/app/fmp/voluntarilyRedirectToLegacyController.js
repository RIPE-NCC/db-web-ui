/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').controller('VoluntarilyRedirectToLegacyCtrl',

        function ($stateParams, $window) {
            var url = '/change-auth/authentication.html?mntnerKey=';

            $window.location.href = url + $stateParams.maintainerKey + '&voluntary=true';
        });

})();
