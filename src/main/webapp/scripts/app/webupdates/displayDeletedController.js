'use strict';

angular.module('webUpdates')
    .controller('DisplayDeletedController', ['$scope', '$state', '$stateParams', '$log', 'MessageStore', 'AlertService',
        function ($scope, $state, $stateParams, $log, MessageStore, AlertService) {

            var _initialisePage = function() {
                AlertService.clearErrors();

                // fetch just created object from temporary store
                var cachedDeletedObjects = MessageStore.get('DELETE_RESULT');

                $scope.deletedObjects = [];

                if (cachedDeletedObjects) {
                    $log.debug(JSON.stringify(cachedDeletedObjects));
                    $scope.deletedObjects = cachedDeletedObjects.objects.object;
                }
            };

            _initialisePage();

        }]);
