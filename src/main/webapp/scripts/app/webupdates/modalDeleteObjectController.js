'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'Some default reason';

        RestService.getVersions(source, objectType, name).then(function(resp) {
                var revision = _.last(resp.data.versions).revision;
                RestService.getReferences(source, objectType, name, revision).then(function (resp) {
                    $scope.references = resp.data.object.incoming;
                });
            }


            //, function (resp) {
            //    $modalInstance.dismiss(resp.data);
            //}
        );

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
