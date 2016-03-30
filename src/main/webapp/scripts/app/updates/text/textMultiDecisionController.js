'use strict';

angular.module('textUpdates')
    .controller('TextMultiDecisionController', ['$scope', '$state', '$log', '$window', 'ModalService', '$modalInstance', 'PreferenceService',
        function ($scope, $state, $log, $window, ModalService, $modalInstance, PreferenceService) {

            $scope.tryNew = tryNew;
            $scope.useOld = useOld;

            _initializePage();

            function _initializePage() {
                if( !PreferenceService.hasMadeSyncUpdatesDecision()) {
                    $log.info('TextMultiDecisionController: Force use to make decision:');
                    // stay on page to force decision
                    modalService.openChoosePoorRichSyncupdates().then(
                        function(useNewSyncUpdates) {
                            if(useNewSyncUpdates) {
                                tryNew();
                            } else {
                                useOld();
                            }
                        },
                        function () {
                            useOld();
                        }
                    );

                } else {
                    $log.info('TextMultiDecisionController: Decision made:' );
                    $log.info('new-mode:' + PreferenceService.isRichSyncupdatesMode() );
                    $log.info('old-mode:' + PreferenceService.isPoorSyncupdatesMode() );

                    // redirect to new or old
                    if( PreferenceService.isRichSyncupdatesMode()) {
                        tryNew();
                    } else {
                        useOld();
                    }
                 }
            }

            function onPoorClicked() {
                $modalInstance.close(false);
            }

            function onRichClicked() {
                $modalInstance.close(true);
            }

            function navigateToNew() {
                PreferenceService.setRichSyncupdatesMode();
                $window.location.href = '/db-web-ui/#/textupdates/multi';
            }

            function navigateToOld() {
                PreferenceService.setPoorSyncupdatesMode();
                $window.location.href = '/syncupdates/simple-rpsl.html';
            }

        }]);
