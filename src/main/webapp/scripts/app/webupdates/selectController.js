'use strict';

angular.module('webUpdates')
    .controller('SelectController', ['$scope', '$state', 'WhoisMetaService',
        function ($scope, $state, WhoisMetaService) {
            $scope.objectTypes = WhoisMetaService.getObjectTypes();
            $scope.selectedObjectType = $scope.objectTypes[0];
            $scope.sources = ['RIPE', 'TEST'];
            $scope.selectedSource = $scope.sources[0];

            $scope.navigateToCreate = function () {
                $state.transitionTo('create', {source: $scope.selectedSource, objectType: $scope.selectedObjectType});
            };
        }]);
