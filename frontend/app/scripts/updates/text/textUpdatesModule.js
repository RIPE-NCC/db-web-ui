/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates', ['updates'])

        .constant(
            'UPDATE_TEXT_STATE', {
                CREATE: 'textupdates.create',
                MODIFY: 'textupdates.modify',
                MULTI: 'textupdates.multi'
            });

})();
