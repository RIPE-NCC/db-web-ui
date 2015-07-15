angular.module('webUpdates').controller('ModalAddAttributeController', [ '$scope', '$modalInstance', 'items',
    function ($scope, $modalInstance, items) {

        console.log( "select attribute :" + JSON.stringify(items));

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
