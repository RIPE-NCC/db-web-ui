/*global beforeEach, describe, expect, inject, it*/

'use strict';

describe('PrefixService', function () {

    var PrefixService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_PrefixService_) {
        PrefixService = _PrefixService_;
    }));

    describe('IPv4', function () {
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

        it('should fail on out-of-range subnet mask', function () {
            expect(PrefixService.isValidPrefix('22.22.0.0/15')).toBe(false);
            expect(PrefixService.isValidPrefix('22.22.0.0/16')).toBe(false);
            expect(PrefixService.isValidPrefix('22.22.0.0/25')).toBe(false);
        });

        it('should fail when address bits are masked', function () {
            try {
                PrefixService.isValidPrefix('192.168.64.0/17');
                expect(true).toBe('should never get here');
            } catch (e) {
                expect(e).toBe('Address out of range for subnet mask');
            }
            try {
                PrefixService.isValidPrefix('192.168.0.1/24');
                expect(true).toBe('should never get here');
            } catch (e) {
                expect(e).toBe('Address out of range for subnet mask');
            }
        });

        it('should fail when address is not complete', function () {
            expect(PrefixService.isValidPrefix('192.168.0/17')).toBe(false);
        });

        it('should fail when subnet mask is missing', function () {
            expect(PrefixService.isValidPrefix('192.168.0.0')).toBe(false);
            expect(PrefixService.isValidPrefix('192.168.0.0/')).toBe(false);
            expect(PrefixService.isValidPrefix('192.168.0.0/0')).toBe(false);
            expect(PrefixService.isValidPrefix('192.168.0.0/00')).toBe(false);
        });

        it('should generate some lovely reverse zone records', function () {
            expect(PrefixService.getReverseDnsZones('22.22.0.0/17').length).toBe(128);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/18').length).toBe(64);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/19').length).toBe(32);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/20').length).toBe(16);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/21').length).toBe(8);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/22').length).toBe(4);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/23').length).toBe(2);
            expect(PrefixService.getReverseDnsZones('22.22.0.0/24').length).toBe(1);
        });

    });

    describe('IPv6', function () {
        it('should be able to validate a bunch of good prefixes', function () {
            expect(PrefixService.isValidPrefix('2001:db8::/48')).toBe(true);
            expect(PrefixService.isValidPrefix('2001:db8::/64')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/19')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/20')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/21')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/22')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/23')).toBe(true);
            // expect(PrefixService.isValidPrefix('2001:db8::1/24')).toBe(true);
        });

        it('should fail on out-of-range subnet mask', function () {
            expect(PrefixService.isValidPrefix('2001:db8::/0')).toBe(false);
            //expect(PrefixService.isValidPrefix('2001:db8::/128')).toBe(false);
        });

        it('should fail when address bits are masked', function () {
            try {
                PrefixService.isValidPrefix('2001:db8::1/48');
                expect(true).toBe('should never get here 1');
            } catch (e) {
                expect(e).toBe('Address out of range for subnet mask');
            }
            try {
                PrefixService.isValidPrefix('2001:db8::/28');
                expect(true).toBe('should never get here 2');
            } catch (e) {
                expect(e).toBe('Address out of range for subnet mask');
            }
        });

        it('should fail when subnet mask is missing', function () {
            expect(PrefixService.isValidPrefix('2001:db8::')).toBe(false);
            expect(PrefixService.isValidPrefix('2001:db8::/')).toBe(false);
            expect(PrefixService.isValidPrefix('2001:db8::/0')).toBe(false);
            expect(PrefixService.isValidPrefix('2001:db8::/00')).toBe(false);
        });

        it('should generate some lovely reverse zone records', function () {
            expect(PrefixService.getReverseDnsZones('2001:db8::/48').length).toBe(1);
            expect(PrefixService.getReverseDnsZones('2001:db8::/47').length).toBe(2);
            expect(PrefixService.getReverseDnsZones('2001:db8::/46').length).toBe(4);
            expect(PrefixService.getReverseDnsZones('2001:db8::/45').length).toBe(8);
            expect(PrefixService.getReverseDnsZones('2001:db8::/44').length).toBe(1);
        });

    });

});
