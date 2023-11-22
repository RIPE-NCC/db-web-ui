import { IpAddressService } from '../../../src/app/myresources/ip-address.service';

describe('IpAddressService', () => {
    it('should return true for ipv4 addres in range or CIDR', () => {
        expect(IpAddressService.isValidIpv4('10.0.128.0 - 10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidIpv4('10.0.128.0-10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidIpv4('10.0.128.0/22')).toBeTruthy();
    });

    it('should convert ipv4 address range to list of CIDR', () => {
        expect(IpAddressService.range2CidrList('10.0.128.0', '10.0.131.255')).toEqual(['10.0.128.0/22']);
    });

    it('should check if is valid range', () => {
        expect(IpAddressService.isValidRange('10.0.128.0 - 10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidRange('10.0.128.0-10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidRange('10.0.128.0')).toBeFalsy();
    });

    it('should check if is valid ipv6', () => {
        expect(IpAddressService.isValidV6('001:0db8:0000:0000:0000:8a2e:0370:7334')).toBeTruthy();
        expect(IpAddressService.isValidV6('2001:db8::8a2e:370:7334')).toBeTruthy();
        expect(IpAddressService.isValidV6('10.0.128.0')).toBeFalsy();
    });

    it('should convert range address to CIDR', () => {
        expect(IpAddressService.rangeToSlash('91.109.48.0 - 91.109.55.255')).toEqual('91.109.48.0/21');
        // in case is already in cidr format return same value
        expect(IpAddressService.rangeToSlash('91.109.48.0/21')).toEqual('91.109.48.0/21');
        // in case is ipv6 address return same value
        expect(IpAddressService.rangeToSlash('2003:fa:7013::/48')).toEqual('2003:fa:7013::/48');
    });

    it('should convert range address to CIDR', () => {
        expect(IpAddressService.getCidrAddress('91.109.48.0 - 91.109.55.255').address).toEqual('91.109.48.0/21');
        expect(IpAddressService.getCidrAddress('91.109.48.0/21').address).toEqual('91.109.48.0/21');
        expect(IpAddressService.getCidrAddress('2003:fa:7013::/48').address).toEqual('2003:fa:7013::/48');
    });
});
