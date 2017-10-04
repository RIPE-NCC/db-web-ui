/*global beforeEach,describe,inject,it*/
'use strict';

describe('The QueryService', function () {

    var service;
    var $httpBackend;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (QueryService, _$httpBackend_) {
        service = QueryService;
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not generate a link if there is no text', function () {
        var qp = {};
        $httpBackend.flush();
        expect(service.buildPermalink(qp)).toEqual("");
        expect(service.buildQueryStringForLink(qp)).toEqual("");
    });

    it('should generate a link for text search', function () {
        var qp = {
            queryText: "   yorkshire   ",
            types: null,
            inverse: null,
            hierarchy: "",
            reverseDomain: false,
            doNotRetrieveRelatedObjects: false,
            showFullObjectDetails: false,
            source: "TEST"
        };
        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire&source=TEST");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire&source=TEST");
        $httpBackend.flush();
    });

    it('should generate a link for a text search with options', function () {
        var qp = {
            queryText: "   yorkshire   ",
            types: {MNTNER: true, ORGANISATION: false, AS_SET: true},
            inverse: {MNT_REF: true, form: false, MNT_BY: true},
            hierarchy: "l",
            reverseDomain: true,
            doNotRetrieveRelatedObjects: true,
            showFullObjectDetails: true,
            source: "TEST"
        };
        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire&inverse=mnt-ref;mnt-by&types=mntner;as-set&" +
            "hierarchyFlag=one-less&dflag=true&rflag=true&bflag=true&source=TEST");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire&inverse-attribute=mnt-ref&" +
            "inverse-attribute=mnt-by&type-filter=mntner&type-filter=as-set&flags=one-less&flags=reverse-domain&" +
            "flags=no-referenced&flags=no-irt&flags=no-filtering&source=TEST");
        $httpBackend.flush();
    });

});
