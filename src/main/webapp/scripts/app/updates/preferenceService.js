'use strict';

angular.module('updates')
    .service('PreferenceService', ['$log', '$cookies', function ($log, $cookies) {
        var EXPIRY = 'Tue, 19 Jan 2038 03:14:07 GMT';
        var PATH = '/';

        var UI_MODE_COOKIE = {
            name: 'pref-ui-mode',
            web: 'webupdates',
            text: 'textupdates',
            defaultValue:'webupdates'
        };

        this.setTextMode = function () {
            _setCookie(UI_MODE_COOKIE.name, UI_MODE_COOKIE.text, undefined);
        }

        this.setWebMode = function () {
            _setCookie(UI_MODE_COOKIE.name, UI_MODE_COOKIE.web, undefined);
        }

        this.isTextMode = function () {
            return _getCookie(UI_MODE_COOKIE.name, UI_MODE_COOKIE.defaultValue) === UI_MODE_COOKIE.text;
        }

        this.isWebMode = function () {
            return _getCookie(UI_MODE_COOKIE.name, UI_MODE_COOKIE.defaultValue) === UI_MODE_COOKIE.web;
        }

        var SYNCUPDATE_MODE_COOKIE = {
            name: 'pref-syncupdates-mode',
            poor: 'poor',
            rich: 'rich',
            defaultValue:'poor'
        };

        this.setRichSyncupdatesMode = function () {
            _setCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.rich, '/');
        }

        this.setPoorSyncupdatesMode = function () {
            _setCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.poor, '/');
        }

        this.isRichSyncupdatesMode = function () {
            return _getCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.defaultValue) === SYNCUPDATE_MODE_COOKIE.rich;
        }

        this.isPoorSyncupdatesMode = function () {
            return _getCookie(SYNCUPDATE_MODE_COOKIE.name, SYNCUPDATE_MODE_COOKIE.defaultValue) === SYNCUPDATE_MODE_COOKIE.poor;
        }

        this.hasMadeSyncUpdatesDecision = function() {
            return _hasCookie(SYNCUPDATE_MODE_COOKIE.name);
        }

        function _hasCookie( name ) {
            var value = $cookies.get(name);
            $log.debug('Is cookie: ' + name + ' set? ' + value );
            return  !_.isUndefined(value);
        }

        function _setCookie( name, value, path ) {
            $log.debug('Setting cookie:' + name + ' to value ' + value);
            $cookies.put(name, value, {
                expires: EXPIRY,
                path: path
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

