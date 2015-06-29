'use strict';

angular.module('dbWebApp')
    .factory( 'CredentialsService', function() {

        var _credentials = undefined;

        return {
            setCredentials: function(mntner, successfulPassword) {
                _credentials = {
                    mntner: mntner,
                    successfulPassword: successfulPassword
                }
            },
            removeCredentials: function() {
                _credentials = undefined;
            },
            hasCredentials: function() {
                return (!_credentials) ? false : true;
            },
            getCredentials: function() { return _credentials; }

        };
});
