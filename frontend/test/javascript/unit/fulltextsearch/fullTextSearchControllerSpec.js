/*global afterEach,beforeEach,describe,expect,inject,it*/

'use strict';

describe('dbWebApp: FullTextSearchController', function () {

    var $log;
    var $http;
    var FullTextSearchService;
    var FullTextResponseService;
    var WhoisMetaService;
    var controller;
    var $httpBackend;
    var $scope;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$controller_, _$log_, _$http_, _FullTextSearchService_, _FullTextResponseService_, _WhoisMetaService_, _$httpBackend_, _$rootScope_) {
        $log = _$log_;
        $http = _$http_;
        FullTextSearchService = _FullTextSearchService_;
        FullTextResponseService = _FullTextResponseService_;
        WhoisMetaService = _WhoisMetaService_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();

        controller = _$controller_('FullTextSearchController', {
            $log: $log,
            FullTextSearchService: FullTextSearchService,
            FullTextResponseService: FullTextResponseService,
            $http: $http,
            WhoisMetaService: WhoisMetaService
        });
    }));

    it('should support addition and removal of object types and attributes', function () {
        var expectedObjectTypes = ['as-block', 'as-set', 'aut-num', 'domain', 'filter-set', 'inet6num', 'inetnum', 'inet-rtr', 'irt', 'key-cert', 'mntner', 'organisation', 'peering-set', 'person', 'poem', 'poetic-form', 'role', 'route', 'route6', 'route-set', 'rtr-set'];
        expect(expectedObjectTypes.length).toEqual(controller.objectTypes.length);

        for (var i = 0; i < expectedObjectTypes.length; i++) {
            expect(expectedObjectTypes[i]).toEqual(controller.objectTypes[i]);
        }
        expect(controller.selectedObjectTypes.length).toEqual(0);
        controller.toggleSearchMode();
        expect(controller.advancedSearch).toEqual(true);

        controller.addObjectToFilter('inetnum');
        expect(controller.selectedObjectTypes.length).toEqual(1);
        controller.addObjectToFilter('inetnum'); // Still 1 coz it's already added
        expect(controller.selectedObjectTypes.length).toEqual(1);
        expect(controller.selectableAttributes.length).toEqual(21); // NOTE! 22 when abuse-c is added to inetnum =)

        controller.selectAll();
        expect(controller.selectedObjectTypes.length).toEqual(21);
        expect(controller.selectableAttributes.length).toEqual(101);

        controller.selectNone();
        expect(controller.selectedObjectTypes.length).toEqual(0);
        expect(controller.selectableAttributes.length).toEqual(0);
    });

});

var spDefault = {
    query: "193.0.0.0",
    start: 0,
    advanced: false,
    advancedMode: 'all',
    searchObjects: [],
    searchAttributes: []
};
