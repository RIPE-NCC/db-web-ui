'use strict';

angular.module('webUpdates').controller('ModalAddAttributeController', [ '$scope', '$uibModalInstance', 'items',
    function ($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
