'use strict';

angular.module('webUpdates')
    .controller('SelectController', ['$scope', '$state', 'WhoisResources',
        function ($scope, $state, WhoisResources) {

            var onCreate = function() {
                /*
                 * UI initialisation
                 */
                $scope.objectTypes = WhoisResources.getObjectTypes();
                $scope.selectedObjectType = $scope.objectTypes[0];
                $scope.sources = ['RIPE', 'TEST'];
                $scope.selectedSource = $scope.sources[0];
            };
            onCreate();

            /*
             * Methods called from the html-teplate
             */

            $scope.navigateToCreate = function () {
                $state.transitionTo('create', {source: $scope.selectedSource, objectType: $scope.selectedObjectType});
            };
        }]);
