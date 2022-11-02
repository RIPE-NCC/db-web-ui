import { PrefixServiceUtils } from 'src/app/domainobject/prefix.service.utils';

describe('PrefixServiceUtils', () => {
    describe('IPv4', () => {
        it('should be able to validate a bunch of good prefixes', () => {
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/16')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/17')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/18')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/19')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/20')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/21')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/22')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/23')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/24')).toBeTruthy();
        });

        it('should fail on out-of-range subnet mask', () => {
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/8')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('22.22.0.0/25')).toBeFalse();
        });

        it('should fail when address bits are masked', () => {
            expect(PrefixServiceUtils.isValidPrefix('192.168.64.0/17')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('192.168.255.0/18')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('192.168.0.1/24')).toBeFalse();
        });

        it('should fail when address is not complete', () => {
            expect(PrefixServiceUtils.isValidPrefix('192.168.0/17')).toBeFalse();
        });

        it('should fail when subnet mask is missing', () => {
            expect(PrefixServiceUtils.isValidPrefix('192.168.0.0')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('192.168.0.0/')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('192.168.0.0/0')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('192.168.0.0/00')).toBeFalse();
        });

        it('should generate some lovely reverse zone records', () => {
            expect(PrefixServiceUtils.getReverseDnsZones('22.0.0.0/16').length).toBe(1);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/17').length).toBe(128);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/18').length).toBe(64);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/19').length).toBe(32);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/20').length).toBe(16);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/21').length).toBe(8);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/22').length).toBe(4);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/23').length).toBe(2);
            expect(PrefixServiceUtils.getReverseDnsZones('22.22.0.0/24').length).toBe(1);
        });
    });

    describe('IPv6', () => {
        it('should be able to validate a bunch of good prefixes', () => {
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/48')).toBeTruthy();
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/64')).toBeTruthy();
        });

        it('should fail on out-of-range subnet mask', () => {
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/0')).toBeFalse();
        });

        it('should fail when address bits are masked', () => {
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::1/48')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/28')).toBeFalse();
        });

        it('should fail when subnet mask is missing', () => {
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/0')).toBeFalse();
            expect(PrefixServiceUtils.isValidPrefix('2001:db8::/00')).toBeFalse();
        });

        it('should generate some lovely reverse zone records', () => {
            expect(PrefixServiceUtils.getReverseDnsZones('2001:db8::/48').length).toBe(1);
            expect(PrefixServiceUtils.getReverseDnsZones('2001:db8::/47').length).toBe(2);
            expect(PrefixServiceUtils.getReverseDnsZones('2001:db8::/46').length).toBe(4);
            expect(PrefixServiceUtils.getReverseDnsZones('2001:db8::/45').length).toBe(8);
            expect(PrefixServiceUtils.getReverseDnsZones('2001:db8::/44').length).toBe(1);
        });
    });
});
