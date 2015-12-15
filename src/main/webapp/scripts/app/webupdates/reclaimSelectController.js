/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimSelectController', ['$scope', '$stateParams', '$state', 'SOURCE', '$log', 'AlertService',
        function ($scope, $stateParams, $state, SOURCE, $log, AlertService) {

            $scope.isFormValid = _isFormValid;
            $scope.navigateToReclaim = _navigateToReclaim;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                $scope.objectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                $scope.selected = {
                    source: SOURCE,
                    objectType: $scope.objectTypes[0],
                    name: undefined
                };
            }

            function _navigateToReclaim() {
                $state.transitionTo('reclaim', {
                    source: $scope.selected.source,
                    objectType: $scope.selected.objectType,
                    name: $scope.selected.name
                });
            }

            function _isFormValid() {
                return $scope.selected.name != undefined && $scope.selected.name !== '';
            }

        }]);

