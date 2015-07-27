'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';

        $scope.delete = function () {
            RestService.deleteObject(source, objectType, name, $scope.reason).then(
                function () {
                    $modalInstance.close();
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
