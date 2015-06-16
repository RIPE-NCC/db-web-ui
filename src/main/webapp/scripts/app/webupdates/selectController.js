'use strict';

angular.module('webUpdates')
    .controller('SelectController', ['$scope', '$state', 'WhoisResources',
        function ($scope, $state, WhoisResources) {
            /*
             * UI initialisation
             */
            $scope.objectTypes = WhoisResources.getObjectTypes();
            $scope.sources = ['RIPE', 'TEST'];

            $scope.selected = {
                source: $scope.sources[0],
                objectType: $scope.objectTypes[0]
            };

            /*
             * Methods called from the html-teplate
             */
            $scope.navigateToCreate = function () {
                $state.transitionTo('create', {source:$scope.selected.source, objectType:$scope.selected.objectType});
            };

        }]);
