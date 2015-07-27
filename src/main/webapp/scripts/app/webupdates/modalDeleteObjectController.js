'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$modalInstance', 'source', 'objectType', 'name',
    function ($scope, $modalInstance, source, objectType, name) {
console.log('source, objectType, name'+source+', '+ objectType+', ' +name);
        $scope.reason = 'Some default reason';

        $scope.delete = function () {
            console.log($scope.reason);
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
