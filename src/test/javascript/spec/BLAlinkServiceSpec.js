'use strict';

describe('dbWebApp: LinkService', function () {

    var linkService;
    var source = 'TEST';

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (LinkService) {
        linkService = LinkService;
    }));

    afterEach(function() {});

    it('linkService is defined', function() {
        expect(_.isUndefined(linkService)).toBe(false);
        expect(_.isUndefined(linkService.getDisplayUrl)).toBe(false);
        expect(_.isFunction(linkService.getDisplayUrl)).toBe(true);
    });

    it('should create a display link for object', function() {
        expect(linkService.getDisplayUrl(source, 'mntner', 'TEST-MNT'))
            .toBe('/db-web-ui/#/webupdates/display/TEST/mntner/TEST-MNT');
    });

    it('should create an href link for object', function() {
        expect(linkService.getLink(source, 'mntner', 'TEST-MNT'))
            .toBe('<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/TEST-MNT">TEST-MNT</a>');
    });

    it('should create mntner links from one end mntner', function() {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, ['MNT1']))
            .toBe('<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT1">MNT1</a>');
    });

    it('should create mntner links from one ripe and one end mntner', function() {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, ['TEST-NCC-MNT', 'MNT1']))
            .toBe('<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT1">MNT1</a>');
    });

    it('should create mntner links from one ripe and two end mntners', function() {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, ['TEST-NCC-MNT', 'MNT1', 'MNT2']))
            .toBe('<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT1">MNT1</a> or ' +
            '<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT2">MNT2</a>');
    });

    it('should create mntner links from one ripe and three end mntners', function() {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, ['TEST-NCC-MNT', 'MNT1', 'MNT2', 'MNT3']))
            .toBe(
            '<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT1">MNT1</a>, ' +
            '<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT2">MNT2</a> or ' +
            '<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/MNT3">MNT3</a>');
    });

    it('should create mntner links from only one ripe mntner', function() {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, ['TEST-NCC-MNT']))
            .toBe('<a target="_blank" href="/db-web-ui/#/webupdates/display/TEST/mntner/TEST-NCC-MNT">TEST-NCC-MNT</a>');
    });

});
