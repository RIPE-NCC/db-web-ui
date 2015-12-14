/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimSelectController', ['$scope', '$stateParams', '$state', 'SOURCE', '$log',
        function ($scope, $stateParams, $state, source, $log) {

            _initialisePage();

            function _initialisePage() {

                $scope.objectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                $scope.selected = {
                    source: source,
                    objectType: $scope.objectTypes[0],
                    name: ''
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
