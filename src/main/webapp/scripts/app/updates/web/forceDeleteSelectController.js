/*global window: false */

(function () {
    'use strict';

    var controller = function ($scope, $stateParams, $state, SOURCE, $log, AlertService, STATE) {

        $scope.isFormValid = _isFormValid;
        $scope.navigateToForceDelete = _navigateToForceDelete;

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

        function _navigateToForceDelete() {
            $state.transitionTo(STATE.FORCE_DELETE, {
                source: $scope.selected.source,
                objectType: $scope.selected.objectType,
                name: $scope.selected.name
            });
        }

        function _isFormValid() {
            return $scope.selected.name !== undefined && $scope.selected.name !== '';
        }

    };

    angular.module('webUpdates')
        .controller('ForceDeleteSelectController',
            ['$scope', '$stateParams', '$state', 'SOURCE', '$log', 'AlertService', 'STATE', controller]);

})();
