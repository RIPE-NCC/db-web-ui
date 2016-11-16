'use strict';

angular.module('updates').factory('CredentialsService', function () {

    var CredentialsService = {};

    var credentials;

    CredentialsService.setCredentials = function (mntner, successfulPassword) {
        credentials = {
            mntner: mntner,
            successfulPassword: successfulPassword
        };
    };

    CredentialsService.removeCredentials = function () {
        credentials = undefined;
    };

    CredentialsService.hasCredentials = function () {
        return angular.isDefined(credentials);
    };

    CredentialsService.getCredentials = function () {
        return credentials;
    };

    CredentialsService.getPasswordsForRestCall = function (objectType) {
        var passwords = [];

        if (CredentialsService.hasCredentials()) {
            passwords.push(credentials.successfulPassword);
        }

        /*
         * For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
         * This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
         */
        if (['route', 'route6', 'aut-num'].indexOf(objectType) > -1) {
            passwords.push('RPSL');
        }
        return passwords;
    };

    return CredentialsService;
});
