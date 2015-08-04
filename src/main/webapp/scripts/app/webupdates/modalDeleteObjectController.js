'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';
        $scope.objectType = objectType;
        $scope.name = name;

        getReferences(source, $scope.objectType, $scope.name);

        $scope.delete = function () {
            RestService.deleteObject(source, $scope.objectType, $scope.name, $scope.reason).then(
                function () {
                    $modalInstance.close();

                    $state.transitionTo('deleted', {
                        source: source,
                        objectType: $scope.objectType,
                        name: $scope.name
                    });

                }, dismissWithFailResponse
            );
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };

        $scope.displayUrl = function(ref) {
            return $state.href('display', {
                source: source,
                objectType: ref.type,
                name: $scope.primaryKey(ref)
            });
        };

        $scope.primaryKey = function(ref) {
            var pkey = ref.primaryKey[0].value;

            for (var i = 1; i < ref.primaryKey.length; i++) {
                pkey = pkey + '/' + ref.primaryKey[i].value;
            }

            return pkey;
        };

        $scope.isMntPersonReference = function(references) {
            return _.every(references, function(ref) {
                    return ref.type.toUpperCase() === 'ROLE' ||
                           ref.type.toUpperCase() === 'PERSON' ||
                           $scope.isItself(ref, $scope.objectType);
                });
        };

        $scope.isItself = function(ref, type) {
            return (ref.type.toUpperCase() === type.toUpperCase() && $scope.primaryKey(ref).toUpperCase() === $scope.name.toUpperCase());
        };

        $scope.canBeDeleted = function(referencesInfo) {
            return referencesInfo.total === 0 || $scope.isMntPersonReference(referencesInfo.references);
        };

        function getReferences(source, objectType, name) {
            RestService.getReferences(source, objectType, name)
                .then(function (resp) {
                    $scope.referencesInfo = resp;
                },
                dismissWithFailResponse
            );
        }

        function dismissWithFailResponse(resp) {
            $modalInstance.dismiss(resp.data);
        }
    }]);
