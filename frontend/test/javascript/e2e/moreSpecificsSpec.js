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
        expect(page.whoisObjectAttrList.all(by.css('li')).count()).toEqual(13);
        expect(page.getListItem(page.whoisObjectAttrList, 0).getText()).toEqual('inetnum:         185.1.76.0 - 185.1.79.255');
        expect(page.getListItem(page.whoisObjectAttrList, 1).getText()).toEqual('netname:         RU-1C-20160322');
        expect(page.getListItem(page.whoisObjectAttrList, 2).getText()).toEqual('country:         FI');
        expect(page.getListItem(page.whoisObjectAttrList, 3).getText()).toEqual('org:             ORG-EIP1-RIPE');
        expect(page.getListItem(page.whoisObjectAttrList, 4).getText()).toEqual('sponsoring-org:  ORG-LA538-RIPE');
        expect(page.getListItem(page.whoisObjectAttrList, 5).getText()).toEqual('admin-c:         MV10039-RIPE');
        expect(page.getListItem(page.whoisObjectAttrList, 6).getText()).toEqual('tech-c:          inty1-ripe');
        expect(page.getListItem(page.whoisObjectAttrList, 7).getText()).toEqual('status:          ASSIGNED PI');
        expect(page.getListItem(page.whoisObjectAttrList, 8).getText()).toEqual('mnt-by:          TPOL888-MNT');
        expect(page.getListItem(page.whoisObjectAttrList, 9).getText()).toEqual('mnt-by:          TPOL888-MNT');
        expect(page.getListItem(page.whoisObjectAttrList, 10).getText()).toEqual('created:         2016-03-22T13:48:02Z');
        expect(page.getListItem(page.whoisObjectAttrList, 11).getText()).toEqual('last-modified:   2016-04-26T14:28:28Z');
        expect(page.getListItem(page.whoisObjectAttrList, 12).getText()).toEqual('source:          RIPE');
    });

    it('should list all the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(true);
        expect(page.moreSpecificsTableRows.count()).toEqual(2);

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('192.87.0.0 - 192.87.0.255');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('inetnum');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('SNET-HOMELAN');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('192.87.1.0 - 192.87.1.255');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('inetnum');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('NFRA');

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

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('2001:7f8::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('inet6num');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('DE-CIX-IXP-20010913');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('2001:7f8:1::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('inet6num');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('AMS-IX-20010913');

    });
});
