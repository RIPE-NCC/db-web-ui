'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';

        $scope.delete = function () {
            RestService.deleteObject(source, objectType, name, $scope.reason).then(
                function () {
                    $modalInstance.close();

                    $state.transitionTo('deleted', {
                        source: source,
                        objectType: objectType,
                        name: name
                    });

                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
