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

        function getReferences(source, objectType, name) {
            RestService.getReferences(source, objectType, name)
                .then(function (resp) {
                    if(!_.isEmpty(resp.references)) $scope.referencesInfo = resp;
                },
                dismissWithFailResponse
            );
        }

        function dismissWithFailResponse(resp) {
            $modalInstance.dismiss(resp.data);
        }
    }]);
