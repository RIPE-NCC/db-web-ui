/*global afterEach, beforeEach, describe, expect, inject, it*/
'use strict';

describe('dbWebApp: SyncupdatesService', function () {

    var $http;
    var service;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$httpBackend_, _SyncupdatesService_) {
        $http = _$httpBackend_;
        service = _SyncupdatesService_;
        $http.whenGET(/.*.html/).respond(200);
        $http.flush();

    }));

    afterEach(function () {
        $http.verifyNoOutstandingExpectation();
        $http.verifyNoOutstandingRequest();
    });

    it('should trim and encode rpslObject content', function () {
        var rpslObject = " some@data ";
        $http.expectPOST('api/syncupdates')
            .respond(200,
                {
                    data: "some%40data",
                }
            );
        service.update(rpslObject);
        $http.flush();
    });

});
