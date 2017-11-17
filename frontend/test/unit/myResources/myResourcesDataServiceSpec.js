/*global beforeEach,describe,inject,it*/
'use strict';

describe('testing ResourcesDataService', function() {

    var $httpBackend;
    var service;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_ResourcesDataService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _ResourcesDataService_;
    }));

    it('Populate IPv4 Resources', function() {
        $httpBackend.expectGET('api/whois-internal/api/resources/ipv4?orgid=ORG-IOB1-RIPE').respond(function() {
            return [200, {
                orgid:'ORG-IOB1-RIPE',
                details:[{
                    range:{
                        string:'62.221.192.0 - 62.221.255.255',
                        slash:'62.221.192.0/18',
                        start:1054720000,
                        end:1054736383
                    },
                    status:'ALLOCATED PA'
                }]
            }, {}];
        });
    });
});
