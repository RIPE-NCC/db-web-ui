/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'ModalService', 'AlertService',
        function ($scope, $stateParams, $state, $log, WhoisResources, ModalService, AlertService) {

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                if( !_.isUndefined($stateParams.name)) {
                    $scope.name = decodeURIComponent($stateParams.name);
                }

                $log.debug('Url params: source:' + $scope.source + '. type:' + $scope.objectType + ', uid:' + $scope.name);


            }

        }]);
