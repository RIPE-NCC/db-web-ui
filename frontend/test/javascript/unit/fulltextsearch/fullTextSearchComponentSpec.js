/*global afterEach,beforeEach,describe,expect,inject,it*/

'use strict';

describe('dbWebApp: FullTextSearchComponent', function () {

    var $componentController;

    var $log;
    var $http;
    var FullTextSearchService;
    var FullTextResponseService;
    var WhoisMetaService;
    var $httpBackend;

    var spDefault = {
        query: "193.0.0.0",
        start: 0,
        advanced: false,
        advancedMode: 'all',
        searchObjects: [],
        searchAttributes: []
    };

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_) {
        $componentController = _$componentController_;
    }));

    beforeEach(inject(function (_$log_, _$http_, _FullTextSearchService_, _FullTextResponseService_, _WhoisMetaService_, _$httpBackend_) {
        $log = _$log_;
        $http = _$http_;
        FullTextSearchService = _FullTextSearchService_;
        FullTextResponseService = _FullTextResponseService_;
        WhoisMetaService = _WhoisMetaService_;
        $httpBackend = _$httpBackend_;
    }));

    it('should support addition and removal of object types and attributes', function () {
        var ctrl = $componentController('fullTextSearch', {
            $log: $log,
            searchService: FullTextSearchService,
            fullTextResponseService: FullTextResponseService,
            whoisMetaService: WhoisMetaService,
            labels: {},
            properties: {}
        });

        var expectedObjectTypes = ['as-block', 'as-set', 'aut-num', 'domain', 'filter-set', 'inet6num', 'inetnum', 'inet-rtr', 'irt', 'key-cert', 'mntner', 'organisation', 'peering-set', 'person', 'poem', 'poetic-form', 'role', 'route', 'route6', 'route-set', 'rtr-set'];

        expect(expectedObjectTypes.length).toEqual(ctrl.objectTypes.length);

        for (var i = 0; i < expectedObjectTypes.length; i++) {
            expect(expectedObjectTypes[i]).toEqual(ctrl.objectTypes[i]);
        }

        expect(ctrl.selectedObjectTypes.length).toEqual(0);
        ctrl.toggleSearchMode();
        expect(ctrl.advancedSearch).toEqual(true);

        ctrl.addObjectToFilter('inetnum');
        expect(ctrl.selectedObjectTypes.length).toEqual(1);
        ctrl.addObjectToFilter('inetnum'); // Still 1 coz it's already added
        expect(ctrl.selectedObjectTypes.length).toEqual(1);
        expect(ctrl.selectableAttributes.length).toEqual(22);

        ctrl.selectAll();
        expect(ctrl.selectedObjectTypes.length).toEqual(21);
        expect(ctrl.selectableAttributes.length).toEqual(101);

        ctrl.selectNone();
        expect(ctrl.selectedObjectTypes.length).toEqual(0);
        expect(ctrl.selectableAttributes.length).toEqual(0);

    });

});
