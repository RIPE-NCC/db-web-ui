/*global afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: CryptService', function () {

    var CryptService;

    beforeEach(module('webUpdates'));

    beforeEach(inject(function (_CryptService_) {
        CryptService = _CryptService_;
    }));

    afterEach(function() {});

    it('crypt', function() {
        expect(CryptService.cryptSalt('password', 'rjK1MckJ')).toEqual('$1$rjK1MckJ$pEARceVLJAOHqoMO/OKRY0');
        expect(CryptService.cryptSalt('password', '.C2JWI4j')).toEqual('$1$.C2JWI4j$QJcccAJXrqTZceIGvUt.E/');
        expect(CryptService.cryptSalt('abcdefghijklmnopqrstuvwxyz', 'uHhYHKnV')).toEqual('$1$uHhYHKnV$6Wi1CEv/OU6/VaU2vYv760');
    });
});
