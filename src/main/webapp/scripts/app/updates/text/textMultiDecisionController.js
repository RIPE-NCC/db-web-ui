'use strict';

angular.module('textUpdates')
    .controller('TextMultiDecisionController', ['$scope', '$state', '$log', '$window', 'ModalService', 'PreferenceService',
        function ($scope, $state, $log, $window, ModalService, PreferenceService) {

            _initializePage();

            function _initializePage() {
                if( !PreferenceService.hasMadeSyncUpdatesDecision()) {
                    $log.info('TextMultiDecisionController: Force use to make decision:');
                    // stay on page to force decision
                    ModalService.openChoosePoorRichSyncupdates().then(
                        function(useNewSyncUpdates) {
                            if(useNewSyncUpdates) {
                                _navigateToNew();
                            } else {
                                _navigateToOld();
                            }
                        },
                        function () {
                            _navigateToOld();
                        }
                    );

                } else {
                    $log.info('TextMultiDecisionController: Decision made:' );
                    $log.info('new-mode:' + PreferenceService.isRichSyncupdatesMode() );
                    $log.info('old-mode:' + PreferenceService.isPoorSyncupdatesMode() );

                    // redirect to new or old
                    if( PreferenceService.isRichSyncupdatesMode()) {
                        _navigateToNew();
                    } else {
                        _navigateToOld();
                    }
                 }
            }

            function _navigateToNew() {
                PreferenceService.setRichSyncupdatesMode();
                $window.location.href = '/db-web-ui/#/textupdates/multi';
            }

            function _navigateToOld() {
                PreferenceService.setPoorSyncupdatesMode();
                $window.location.href = '/syncupdates/simple-rpsl.html';
            }

        }]);
