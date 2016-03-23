'use strict';

angular.module('textUpdates')
    .controller('TextMultiDecisionController', ['$scope', '$state', '$log', '$window', 'PreferenceService',
        function ($scope, $state, $log, $window, PreferenceService) {

            $scope.tryNew = tryNew;
            $scope.useOld = useOld;

            _initializePage();

            function _initializePage() {
                if( !PreferenceService.hasMadeSyncUpdatesDecision()) {
                    $log.info('TextMultiDecisionController: Force use to make decision:');
                    // stay on page to force decision

                } else {
                    $log.info('TextMultiDecisionController: Decision made:' );
                    $log.info('new-mode:' + PreferenceService.isNewSyncupdatesMode() );
                    $log.info('old-mode:' + PreferenceService.isOldSyncupdatesMode() );

                    // redirect to new or old
                    if( PreferenceService.isNewSyncupdatesMode()) {
                        tryNew();
                    } else {
                        useOld();
                    }
                 }
            }

            function tryNew() {
                PreferenceService.setNewSyncupdates();
                $state.transitionTo('textupdates.multi');
            }

            function useOld() {
                PreferenceService.setOldSyncupdatesMode();
                $window.location.href = '/syncupdates/simple-rpsl.html';
            }

        }]);
