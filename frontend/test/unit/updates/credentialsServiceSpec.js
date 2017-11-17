'use strict';

describe('updates: CredentialsService', function () {

    var $credentialsService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (CredentialsService) {
        $credentialsService = CredentialsService;
    }));

    it('initial state',function() {
        expect($credentialsService.hasCredentials()).toEqual(false);
        expect($credentialsService.getCredentials()).toBeUndefined();
    });

    it('read credentials',function() {
        $credentialsService.setCredentials('TEST-MNT', 'secret');
        expect($credentialsService.hasCredentials()).toEqual(true);
        expect($credentialsService.getCredentials()).toEqual({mntner:'TEST-MNT', successfulPassword:'secret'});
        $credentialsService.removeCredentials();
        expect($credentialsService.hasCredentials()).toEqual(false);
        expect($credentialsService.getCredentials()).toBeUndefined();
    });

});
