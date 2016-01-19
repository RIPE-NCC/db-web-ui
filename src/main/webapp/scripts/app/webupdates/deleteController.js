/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('DeleteController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'ModalService', 'AlertService',
        function ($scope, $stateParams, $state, $log, WhoisResources, ModalService, AlertService) {

            //this page does not raise a modal for authentication. It can be user directly either
            // if you are logged in and the object has your maintainers or if you have provided password
            // in the modify screen
            //TODO [TP]: modularise the authentication logic from createController and use it both in create/modify and in delete

            _initialisePage();

            function _initialisePage() {

                $scope.modalInProgress = true;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = decodeURIComponent($stateParams.name);
                $scope.onCancel = $stateParams.onCancel;

                $log.debug('Url params: source:' + $scope.source + '. type:' + $scope.objectType + ', uid:' + $scope.name);

                $scope.deletedObjects = [];

                _deleteObject();
            }

            function _deleteObject() {
                $log.debug("_deleteObject called");
                ModalService.openDeleteObjectModal($scope.source, $scope.objectType, $scope.name, $scope.onCancel).then(
                    function (whoisResources) {
                        $scope.modalInProgress = false;
                        $scope.deletedObjects = whoisResources.objects.object;
                        $log.debug('SUCCESS delete object' + JSON.stringify(whoisResources));
                        $scope.deletedObjects = whoisResources.objects.object;
                        AlertService.setGlobalInfo('The following object(s) have been successfully deleted');
                    },
                    function (errorResp) {
                        $scope.modalInProgress = false;
                        $log.debug('ERROR deleting object'+JSON.stringify(errorResp));
                        AlertService.setErrors(errorResp.data);
                    }
                );
            }

        }]);
