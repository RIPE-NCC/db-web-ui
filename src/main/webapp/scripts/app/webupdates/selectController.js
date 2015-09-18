'use strict';

angular.module('webUpdates')
    .controller('SelectController', ['$scope', '$state', 'WhoisResources', 'SOURCE',
        function ($scope, $state, WhoisResources, source) {
            /*
             * UI initialisation
             */
            $scope.objectTypes = WhoisResources.getObjectTypes();

            $scope.selected = {
                //source: $scope.sources[0],
                source: source,
                objectType: $scope.objectTypes[0]
            };

            /*
             * Methods called from the html-teplate
             */

            $scope.navigateToCreate = function () {
                $state.transitionTo('create', {source:$scope.selected.source, objectType:$scope.selected.objectType});
            };

        }]);
