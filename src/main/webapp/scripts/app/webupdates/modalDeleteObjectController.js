'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';

        getReferences(source, objectType, name);

        $scope.delete = function () {
            RestService.deleteObject(source, objectType, name, $scope.reason).then(
                function () {
                    $modalInstance.close();

                    $state.transitionTo('deleted', {
                        source: source,
                        objectType: objectType,
                        name: name
                    });

                }, dismissWithFailResponse
            );
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };

        $scope.display = function(ref) {
            $state.transitionTo('display', {
                source: source,
                objectType: ref.type,
                name: ref.pkey
            });
        };

        function getReferences(source, objectType, name) {
            RestService.getReferences(source, objectType, name)
                .then(function (resp) {
                    if(!_.isEmpty(resp.data.references)) $scope.references = resp.data.references;
                },
                dismissWithFailResponse
            );
        }

        function dismissWithFailResponse(resp) {
            $modalInstance.dismiss(resp.data);
        }
    }]);
