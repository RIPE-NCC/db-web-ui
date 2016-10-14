/*global angular*/

(function() {
'use strict';

angular.module('webUpdates', ['updates'])
    .constant(
        'STATE', {
            CREATE:              'webupdates.create',
            SELECT:              'webupdates.select',
            MODIFY:              'webupdates.modify',
            DELETE:              'webupdates.delete',
            DISPLAY:             'webupdates.display',
            FORCE_DELETE:        'webupdates.forceDelete',
            FORCE_DELETE_SELECT: 'webupdates.forceDeleteSelect'
        })
    .run(['$rootScope', '$state', '$log', function ($rootScope, $state, $log) {

        $log.info('Starting up web-updates module');

        // expand the update section on the left menu
        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (!_.isUndefined(toState) && !_.isUndefined(toState.name) && _.startsWith(toState.name, 'webupdates.')) {
                $log.debug('updates: Incoming transition to state: ' + toState.name);
                $rootScope.$emit('dbWebApp.moduleActive', 'updates');
            }
        });

    }]);
})();
