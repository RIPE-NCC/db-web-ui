'use strict';

angular.module('dbWebApp')
    .factory( 'CredentialsService', function() {

        var _credentials;

        return {
            setCredentials: function(mntner, successfulPassword) {
                _credentials = {
                    mntner: mntner,
                    successfulPassword: successfulPassword
                };
            },
            removeCredentials: function() {
                _credentials = undefined;
            },
            hasCredentials: function() {
                return _credentials !== undefined;
            },
            getCredentials: function() { return _credentials; }

        };
});
