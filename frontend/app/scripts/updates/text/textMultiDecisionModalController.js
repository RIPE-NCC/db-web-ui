/*global angular*/
(function () {
    'use strict';

    angular.module('textUpdates').controller('TextMultiDecisionModalController', ['$scope', '$uibModalInstance', function ($scope, $modalInstance) {

        $scope.onPoorClicked = function () {
            $modalInstance.close(false);
        };

        $scope.onRichClicked = function () {
            $modalInstance.close(true);
        };

        $scope.cancel = function () {
            $modalInstance.close(false);
        };

    }]);

})();
