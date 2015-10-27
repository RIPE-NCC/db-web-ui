/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('DeleteController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'ModalService', 'AlertService',
        function ($scope, $stateParams, $state, $log, WhoisResources, ModalService, AlertService) {


            _initialisePage();

            function _initialisePage() {

                $scope.modalInProgress = true;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                if( !_.isUndefined($stateParams.name)) {
                    $scope.name = decodeURIComponent($stateParams.name);
                }

                $log.debug('Url params: source:' + $scope.source + '. type:' + $scope.objectType + ', uid:' + $scope.name);

                $scope.deletedObjects = [];


                _deleteObject();
            }

            function _deleteObject() {
                ModalService.openDeleteObjectModal($scope.source, $scope.objectType, $scope.name).then(
                    function (whoisResources) {
                        $scope.deletedObjects = whoisResources.objects.object;
                        if (whoisResources) {
                            $log.debug(JSON.stringify(whoisResources));
                            $scope.deletedObjects = whoisResources.objects.object;
                        }
                        $scope.modalInProgress = false;
                    },
                    function (errorResp) {
                        try {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            AlertService.setErrors(whoisResources);
                        }
                        catch (err) {
                            AlertService.setGlobalError('Error deleting object. Please reload and try again.');
                        }
                        $scope.modalInProgress = false;
                    }
                );
            }

        }]);
