/*global afterEach, beforeEach, describe, inject, it*/

describe('The FullTextSearchService', function () {

    var service;
    var $httpBackend;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (FullTextSearchService, _$httpBackend_) {
        service = FullTextSearchService;
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be able to encode query text', function (done) {
        $httpBackend
            .when("GET", "api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(ops4%5C-ripe)&start=0&wt=json")
            .respond(200);

        var query = "ops4-ripe";
        var start = 0;
        var advanced = false;
        var advancedMode = "";
        var searchObjects = [];
        var searchAttributes = [];
        service.doSearch(
            query,
            start,
            advanced,
            advancedMode,
            searchObjects,
            searchAttributes).then(function() {
                done();
        });
        $httpBackend.flush();
    });

    it('should be able to encode various', function (done) {
        $httpBackend
            .when("GET", "api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(remarks:(ops4%5C-ripe))+AND+(object-type:inetnum+OR+object-type:mntner)&start=0&wt=json")
            .respond(200);

        var query = "ops4-ripe";
        var start = 0;
        var advanced = true;
        var advancedMode = "all";
        var searchObjects = ["inetnum", "mntner"];
        var searchAttributes = ["remarks"];
        service.doSearch(
            query,
            start,
            advanced,
            advancedMode,
            searchObjects,
            searchAttributes).then(function() {
                done();
        });
        $httpBackend.flush();
    });

    it('should be able to encode advanced all options', function (done) {
        $httpBackend
            .when("GET", "api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(ops4%5C-ripe+AND+etch%5C-mnt)+AND+(object-type:inetnum+OR+object-type:mntner)&start=0&wt=json")
            .respond(200);

        var query = "ops4-ripe etch-mnt";
        var start = 0;
        var advanced = true;
        var advancedMode = "all";
        var searchObjects = ["inetnum", "mntner"];
        var searchAttributes = [];
        service.doSearch(
            query,
            start,
            advanced,
            advancedMode,
            searchObjects,
            searchAttributes).then(function() {
                done();
        });
        $httpBackend.flush();
    });

    it('should be able to encode advanced any options', function (done) {
        $httpBackend
            .when("GET", "api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(ops4%5C-ripe+OR+etch%5C-mnt)+AND+(object-type:inetnum+OR+object-type:mntner)&start=0&wt=json")
            .respond(200);

        var query = "ops4-ripe etch-mnt";
        var start = 0;
        var advanced = true;
        var advancedMode = "any";
        var searchObjects = ["inetnum", "mntner"];
        var searchAttributes = [];
        service.doSearch(
            query,
            start,
            advanced,
            advancedMode,
            searchObjects,
            searchAttributes).then(function() {
                done();
        });
        $httpBackend.flush();
    });

    it('should be able to encode advanced exact options', function (done) {
        $httpBackend
            .when("GET", "api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(remarks:(%22ops4%5C-ripe+etch%5C-mnt%22)+OR+country:(%22ops4%5C-ripe+etch%5C-mnt%22))+AND+(object-type:inetnum+OR+object-type:mntner)&start=0&wt=json")
            .respond(200);

        var query = "ops4-ripe etch-mnt";
        var start = 0;
        var advanced = true;
        var advancedMode = "exact";
        var searchObjects = ["inetnum", "mntner"];
        var searchAttributes = ["remarks", "country"];
        service.doSearch(
            query,
            start,
            advanced,
            advancedMode,
            searchObjects,
            searchAttributes).then(function() {
                done();
        });
        $httpBackend.flush();
    });

});
