/*global afterEach, beforeEach, describe, expect, inject, it*/
'use strict';

describe('MoreSpecificsDataService', function() {

    var $httpBackend;
    var service;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_MoreSpecificsService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _MoreSpecificsService_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should reject invalid initialization', function() {

        expect(function() {
            service.getSpecifics();
        }).toThrowError();

        expect(function() {
            service.getSpecifics('OBJECT_NAME');
        }).toThrowError();

        expect(function() {
            service.getSpecifics(0, 'OBJECT_TYPE');
        }).toThrowError();

        $httpBackend.when('GET', 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=').respond();
        service.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE');
        $httpBackend.flush();

        $httpBackend.when('GET', 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER').respond();
        service.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', undefined, 'FILTER');
        $httpBackend.flush();

        $httpBackend.when('GET', 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=0').respond();
        service.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', 0, 'FILTER');
        $httpBackend.flush();

        $httpBackend.when('GET', 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=1').respond();
        service.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', '1', 'FILTER');
        $httpBackend.flush();

    });
});
