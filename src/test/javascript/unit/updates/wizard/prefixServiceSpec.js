/*global beforeEach, describe, expect, inject, it*/

'use strict';

describe('prefixService', function () {

    var PrefixService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_PrefixService_) {
        PrefixService = _PrefixService_;
    }));

    it('should be able to validate a bunch of good prefixes', function () {
        expect(PrefixService.isValidPrefix('22.22.0.0/17')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/18')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/19')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/20')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/21')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/22')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/23')).toBe(true);
        expect(PrefixService.isValidPrefix('22.22.0.0/24')).toBe(true);
    });

    it('should fail on out-of-range bitmask', function () {
        expect(PrefixService.isValidPrefix('22.22.0.0/15')).toBe(false);
        expect(PrefixService.isValidPrefix('22.22.0.0/16')).toBe(false);
        expect(PrefixService.isValidPrefix('22.22.0.0/25')).toBe(false);
    });

    it('should fail when address bits are masked', function () {
        expect(PrefixService.isValidPrefix('192.168.64.0/17')).toBe(false);
        expect(PrefixService.isValidPrefix('192.168.0.1/24')).toBe(false);
    });

    it('should fail when address is not complete', function () {
        expect(PrefixService.isValidPrefix('192.168.0/17')).toBe(false);
    });

    it('should fail when bitmask is missing', function () {
        expect(PrefixService.isValidPrefix('192.168.0.0')).toBe(false);
    });

});
