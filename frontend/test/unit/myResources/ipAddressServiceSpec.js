/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('testing IpAddressService', function () {

    var service;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_IpAddressService_) {
        service = _IpAddressService_;
    }));

    it('IPv4 Start Address', function() {
        expect(service.getIpv4Start({
            string: '10.0.128.0 - 10.0.131.255',
            slash: '10.0.128.0/22'
        })).toEqual(167804928);
    });

    it('IPv4 End Address', function() {
        expect(service.getIpv4End({
            string: '10.0.128.0 - 10.0.131.255',
            slash: '10.0.128.0/22'
        })).toEqual(167805951);
    });

    it('Convert ipv4 address range to list of CIDR', function () {
        expect(service.range2CidrList('10.0.128.0', '10.0.131.255')).toEqual(['10.0.128.0/22']);
    });
});
