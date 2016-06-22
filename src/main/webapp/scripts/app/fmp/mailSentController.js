/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').controller('MailSentCtrl', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.email = $stateParams.email;
        }]);
    
})();
