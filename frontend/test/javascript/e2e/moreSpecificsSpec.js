/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');


describe('My Resources detail for inetnum', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255');

    });

    it('should show whois object attributes', function() {
        expect(page.whoisObject.isPresent()).toEqual(true);
    });

    it('should list all the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(true);
        expect(page.moreSpecificsTableRows.count()).toEqual(2);

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toBe('192.87.0.0 - 192.87.0.255');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toBe('inetnum');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toBe('SNET-HOMELAN');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toBe('192.87.1.0 - 192.87.1.255');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toBe('inetnum');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toBe('NFRA');

    });

});

describe('My Resources detail for inet6num', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inet6num/2001:7f8::/29');

    });

    it('should list all the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(true);
        expect(page.moreSpecificsTableRows.count()).toEqual(2);

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toBe('2001:7f8::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toBe('inet6num');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toBe('DE-CIX-IXP-20010913');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toBe('2001:7f8:1::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toBe('inet6num');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toBe('AMS-IX-20010913');

    });
});
