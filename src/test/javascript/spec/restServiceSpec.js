'use strict';

describe('dbWebApp: RestService', function () {

    var restService;
    var $httpBackend;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_RestService_, _$httpBackend_) {
        restService = _RestService_;
        $httpBackend = _$httpBackend_;

        $httpBackend.whenGET(/.*.html/).respond(200);
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

        $httpBackend.expectDELETE('api/whois/'+source+'/'+objectType+'/'+name+'?reason='+reason).respond(200);

        restService.deleteObject(source, objectType, name, reason);
        $httpBackend.flush();
    });

});
