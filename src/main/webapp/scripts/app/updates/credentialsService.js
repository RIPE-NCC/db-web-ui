'use strict';

angular.module('updates')
    .service( 'CredentialsService', function() {

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
