'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'I don\'t need this object';

        $scope.delete = function () {
            RestService.deleteObject(source, objectType, name, $scope.reason).then(
                function () {
                    $modalInstance.close();

                    $state.transitionTo('deleted', {
                        source: source,
                        objectType: objectType,
                        name: name
                    });

                }, function (resp) {
                    $modalInstance.dismiss(resp.data);
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };
    }]);
