'use strict';

angular.module('updates')
    .service('PreferenceService', ['$log', '$cookies', function ($log, $cookies) {
        var EXPIRY = 'Tue, 19 Jan 2038 03:14:07 GMT';
        var COOKIE_NAME = 'pref-ui-mode';
        var WEB_UPDATES = 'webupdates';
        var TEXT_UPDATES = 'textupdates';

        this.setTextMode = function () {
            $log.debug('Setting text-mode');
            $cookies.put(COOKIE_NAME, TEXT_UPDATES, {
                expires: EXPIRY
            });
        }

        this.isTextMode = function () {
            var status = $cookies.get(COOKIE_NAME) === TEXT_UPDATES;
            $log.debug('text-mode:' + status);
            return status;
        }

        this.setWebMode = function () {
            $log.debug('Setting web-mode');
            $cookies.put(COOKIE_NAME, WEB_UPDATES, {
                expires: EXPIRY
            });
        }

        this.isWebMode = function () {
            var mode = $cookies.get(COOKIE_NAME);
            var status =  _.isUndefined(mode) || mode === WEB_UPDATES;
            $log.debug('web-mode:' + status);
            return status;
        }

    }]);

