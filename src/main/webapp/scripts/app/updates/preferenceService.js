'use strict';

angular.module('updates')
    .service('PreferenceService', ['$log', '$cookies', function ($log, $cookies) {
        var EXPIRY = 'Tue, 19 Jan 2038 03:14:07 GMT';

        var TEXT_MODE_COOKIE = {
            name: 'pref-ui-mode',
            web: 'webupdates',
            text: 'textupdates'
        };

        this.setTextMode = function () {
            _setCookie(TEXT_MODE_COOKIE.name, TEXT_MODE_COOKIE.text);
        }

        this.setWebMode = function () {
            _setCookie(TEXT_MODE_COOKIE.name, TEXT_MODE_COOKIE.web);
        }

        this.isTextMode = function () {
            return _getCookie(TEXT_MODE_COOKIE.name, TEXT_MODE_COOKIE.web) === TEXT_MODE_COOKIE.text;
        }

        this.isWebMode = function () {
            return _getCookie(TEXT_MODE_COOKIE.name, TEXT_MODE_COOKIE.web) === TEXT_MODE_COOKIE.web;
        }

        var SYNCUPDATE_MODE_COOKIE = {
            name: 'pref-syncupdates-mode',
            old: "old",
            new: 'new'
        };

        this.setNewSyncupdatesMode = function () {
            _setCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.new);
        }

        this.setOldSyncupdatesMode = function () {
            _setCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.old);
        }

        this.isNewSyncupdatesMode = function () {
            return _getCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.old) === SYNCUPDATE_MODE_COOKIE.new;
        }

        this.isOldSyncupdatesMode = function () {
            return _getCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.old) === SYNCUPDATE_MODE_COOKIE.old;
        }

        this.hasMadeSyncUpdatesDecision = function() {
            return _hasCookie(SYNCUPDATE_MODE_COOKIE.name);
        }

        function _hasCookie( name ) {
            var value = $cookies.get(name);
            $log.debug('Is cookie: ' + name + ' set? ' + value );
            return  !_.isUndefined(value);
        }

        function _setCookie( name, value ) {
            $log.debug('Setting cookie:' + name + ' to value ' + value);
            $cookies.put(name, value, {
                expires: EXPIRY
            });
        }

        function _getCookie( name, defaulValue ) {
            var value = $cookies.get(name);
            if( _.isUndefined(value)) {
                value = defaulValue;
                $log.debug('Cookie: ' + name + ' use dafault:' + value);
            } else {
                $log.debug('Cookie: ' + name + ' has value:' + value);
            }
            return value;
        }

    }]);

