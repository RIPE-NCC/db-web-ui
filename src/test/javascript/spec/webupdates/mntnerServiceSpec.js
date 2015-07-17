'use strict';

describe('webUpdates: MntnerService', function () {

    var authenticationLogic;

    beforeEach(function () {
        module('webUpdates');
    });

    beforeEach(inject(function (AuthenticationLogic) {
        authenticationLogic = AuthenticationLogic;
    }));

    afterEach(function () {
    });

/*
    it('should filter the mntners for password popup - only password', function () {
        var selectedMaintainers = [
            {"key": "A-MNT", "type": "mntner", "auth": ["MD5-PW"]},
            {"key": "B-MNT", "type": "mntner", "auth": ["MD5-PW", "MD5-PW"]}];

        expect(authenticationLogic.getMntnerWithPasswords(selectedMaintainers).length).toBe(2);
    });

    it('should filter the mntners for password popup - SSO but not mine', function () {
        var selectedMaintainers = [
            {"key": "A-MNT", "type": "mntner", "auth": ["SSO", "MD5-PW"]}];

        expect(authenticationLogic.getMntnerWithPasswords(selectedMaintainers).length).toBe(1);
    });

    it('should filter the mntners for password popup - SSO mine', function () {
        var selectedMaintainers = [
            {"key": "A-MNT", "type": "mntner", "auth": ["SSO"], "mine": true},
            {"key": "B-MNT", "type": "mntner", "auth": ["MD5-PW"]}];

        expect(authenticationLogic.getMntnerWithPasswords(selectedMaintainers).length).toBe(0);
    });

    it('should filter the mntners for password popup - only PGP', function () {
        var selectedMaintainers = [
            {"key": "A-MNT", "type": "mntner", "auth": ["PGPKEY-XX"]}];

        expect(authenticationLogic.getMntnerWithPasswords(selectedMaintainers).length).toBe(0);
    });

    it('should not authenticate object with sso mntner', function () {


    });

    it('should not authenticate object with credential mntner', function () {

    });

    it('should not authenticate unknown mntner', function () {
        var selectedMaintainers = [
            {"key": "A-MNT", "type": "mntner", "auth": ["MD5-PW"]},
            {"key": "B-MNT", "type": "mntner", "auth": ["MD5-PW", "MD5-PW"]}];

        expect($scope.needsPasswordAuthentication(selectedMaintainers)).toBe(true);
    });
*/

});
