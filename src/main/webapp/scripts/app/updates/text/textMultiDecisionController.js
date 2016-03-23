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

            function tryNew() {
                PreferenceService.setRichSyncupdatesMode();
                $window.location.href = '/db-web-ui/#/textupdates/multi';
            }

            function useOld() {
                PreferenceService.setPoorSyncupdatesMode();
                $window.location.href = '/syncupdates/simple-rpsl.html';
            }

        }]);
