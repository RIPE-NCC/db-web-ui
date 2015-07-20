'use strict';

describe('dbWebApp: CryptService', function () {

    var cryptService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_CryptService_) {
        cryptService = _CryptService_;
    }));

    afterEach(function() {});

    it('crypt', function() {
        expect(cryptService.cryptSalt('password', 'rjK1MckJ')).toEqual("$1$rjK1MckJ$pEARceVLJAOHqoMO/OKRY0");
        expect(cryptService.cryptSalt('password', '.C2JWI4j')).toEqual("$1$.C2JWI4j$QJcccAJXrqTZceIGvUt.E/");
        //expect($scope.crypt('abcdefghijklmnopqrstuvwxyz', 'uHhYHKnV'))        // TODO: fails on longer passwords
        //    .toEqual("$1$uHhYHKnV$6Wi1CEv/OU6/VaU2vYv760");
    });
});