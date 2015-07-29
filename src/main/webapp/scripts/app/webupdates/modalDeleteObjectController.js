'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';

        getVersions(source, objectType, name);

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

        function getVersions(source, objectType, name) {
            RestService.getVersions(source, objectType, name)
                .then(function (resp) {
                    var revision = _.last(resp.data.versions).revision;
                    getReferences(source, objectType, name, revision);
                },
                dismissWithFailResponse
            );
        }

        function getReferences(source, objectType, name, revision) {
            RestService.getReferences(source, objectType, name, revision)
                .then(function (resp) {
                    $scope.references = resp.data.incoming;
                },
                dismissWithFailResponse
            );
        }

        function dismissWithFailResponse(resp) {
            $modalInstance.dismiss(resp.data);
        }
    }]);
