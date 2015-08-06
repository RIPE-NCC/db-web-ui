'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'I don\'t need this object';
        $scope.objectType = objectType;
        $scope.name = name;

        getReferences(source, $scope.objectType, $scope.name);

        $scope.delete = function () {
            var deleteWithRefs = $scope.isMntPersonReference($scope.referencesInfo.references);

            RestService.deleteObject(source, $scope.objectType, $scope.name, $scope.reason, deleteWithRefs).then(
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
            if(references.length === 0) {
                return false;
            }

            if ((references.length === 1) && $scope.isItself(references[0], $scope.objectType)) {
                return false;
            }

            if($scope.objectType.toUpperCase() === 'MNTNER') {
                return _.every(references, function(ref) {
                    return ref.type.toUpperCase() === 'ROLE' ||
                        ref.type.toUpperCase() === 'PERSON' ||
                        $scope.isItself(ref, objectType);
                });
            }

            if($scope.objectType.toUpperCase() === 'ROLE' || $scope.objectType.toUpperCase() === 'PERSON') {
                return _.every(references, function(ref) {
                    return ref.type.toUpperCase() === 'MNTNER' ||
                        $scope.isItself(ref, $scope.objectType);
                });
            }

            return false;
        };

        $scope.isItself = function(ref) {
            return (ref.type.toUpperCase() === $scope.objectType.toUpperCase() && $scope.primaryKey(ref).toUpperCase() === $scope.name.toUpperCase());
        };

        $scope.canBeDeleted = function(referencesInfo) {
            return referencesInfo.total === 0 || $scope.isMntPersonReference(referencesInfo.references, $scope.objectType);
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
