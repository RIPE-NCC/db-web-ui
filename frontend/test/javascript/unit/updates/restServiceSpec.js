/*global afterEach, beforeEach, describe, inject, it*/
'use strict';

describe('updates: RestService', function () {

    var restService;
    var $httpBackend;

    beforeEach(module('updates'));

    beforeEach(inject(function (_RestService_, _$httpBackend_) {
        restService = _RestService_;
        $httpBackend = _$httpBackend_;

        $httpBackend.whenGET(/.*\.html/).respond(200);
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should send a http delete when deleting an object', function() {
        var source = 'RIPE';
        var objectType = 'MNT';
        var name = 'TEST-MNT';
        var reason = 'testing';

        $httpBackend.expectDELETE('api/whois/'+source+'/'+objectType+'/'+name+'?dry-run=false&reason='+reason).respond(200);

        restService.deleteObject(source, objectType, name, reason, false);
        $httpBackend.flush();
    });

    it('should send a http delete when deleting an object with references', function() {
        var source = 'RIPE';
        var objectType = 'MNT';
        var name = 'TEST-MNT';
        var reason = 'testing';

        $httpBackend.expectDELETE('api/references/'+source+'/'+objectType+'/'+name+'?dry-run=false&reason='+reason).respond(200);

        restService.deleteObject(source, objectType, name, reason, true);
        $httpBackend.flush();
    });

    it('should send a http get when requesting references', function() {
        var source = 'RIPE';
        var objectType = 'MNT';
        var name = 'TEST-MNT';

        $httpBackend.expectGET('api/references/'+source+'/'+objectType+'/'+name).respond(200);

        restService.getReferences(source, objectType, name);
        $httpBackend.flush();
    });

});
