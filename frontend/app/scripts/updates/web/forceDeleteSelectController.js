/*global angular*/

(function () {
    'use strict';

    angular.module('webUpdates').controller('ForceDeleteSelectController', ['$scope', '$stateParams', '$state', 'Properties', '$log', 'AlertService', 'STATE',

        function ($scope, $stateParams, $state, Properties, $log, AlertService, STATE) {

            $scope.isFormValid = _isFormValid;
            $scope.navigateToForceDelete = _navigateToForceDelete;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                $scope.objectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                $scope.selected = {
                    source: Properties.SOURCE,
                    objectType: $scope.objectTypes[0],
                    name: undefined
                };
            }

            function _navigateToForceDelete() {
                return $state.transitionTo(STATE.FORCE_DELETE, {
                    source: $scope.selected.source,
                    objectType: $scope.selected.objectType,
                    name: $scope.selected.name
                });
            }

            function _isFormValid() {
                return $scope.selected.name !== undefined && $scope.selected.name !== '';
            }

        }]);

})();
