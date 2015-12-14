/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimSelectController', ['$scope', '$stateParams', '$state', 'SOURCE', '$log',
        function ($scope, $stateParams, $state, SOURCE, $log) {

            _initialisePage();

            function _initialisePage() {

                $scope.objectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                $scope.selected = {
                    source: SOURCE,
                    objectType: $scope.objectTypes[0],
                    name: undefined
                };
            }

            $scope.navigateToReclaim = function () {
                $state.transitionTo('reclaim', {
                    source: $scope.selected.source,
                    objectType: $scope.selected.objectType,
                    name: $scope.selected.name
                });

            };
        }]);
