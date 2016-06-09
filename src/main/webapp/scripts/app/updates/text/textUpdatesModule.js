/*global angular*/

(function () {
    'use strict';
    
    angular.module('textUpdates', ['updates'])

        .constant(
            'UPDATE_TEXT_STATE', {
                CREATE: 'textupdates.create',
                MODIFY: 'textupdates.modify',
                MULTI: 'textupdates.multi',
            })

        .run(['$rootScope', '$state', '$log', function ($rootScope, $state, $log) {

            $log.info('Starting up text-updates module');

            // expand the update section of the menu
            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                if (!_.isUndefined(toState) && !_.isUndefined(toState.name) && _.startsWith(toState.name, 'textupdates.')) {
                    $log.debug('updates: Incoming transition to state: ' + toState.name);
                    $rootScope.$emit('dbWebApp.moduleActive', 'updates');
                }
            });

        }]);

})();
