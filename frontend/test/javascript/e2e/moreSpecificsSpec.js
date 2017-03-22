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

        var whoisObject = page.getWhoisObject();
        var attributes = whoisObject.attributes();

        expect(whoisObject.isPresent()).toEqual(true);
        expect(attributes.count()).toEqual(13);
        expect(attributes.get(0).getText()).toMatch(/inetnum: *192\.87\.0\.0 - 192\.87\.255\.255/);
        expect(attributes.get(1).getText()).toMatch(/netname: *RU-1C-20160322/);
        expect(attributes.get(2).getText()).toMatch(/country: *FI/);
        expect(attributes.get(3).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
        expect(attributes.get(4).getText()).toMatch(/sponsoring-org: *ORG-LA538-RIPE/);
        expect(attributes.get(5).getText()).toMatch(/admin-c: *MV10039-RIPE/);
        expect(attributes.get(6).getText()).toMatch(/tech-c: *inty1-ripe/);
        expect(attributes.get(7).getText()).toMatch(/status: *ASSIGNED PI/);
        expect(attributes.get(8).getText()).toMatch(/mnt-by: *TPOL888-MNT/);
        expect(attributes.get(10).getText()).toMatch(/created: *2016-03-22T13:48:02Z/);
        expect(attributes.get(11).getText()).toMatch(/last-modified: *2016-04-26T14:28:28Z/);
        expect(attributes.get(12).getText()).toMatch(/source:( *)RIPE/);
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

    it('should show whois object attributes', function() {

        var whoisObject = page.getWhoisObject();
        var attributes = whoisObject.attributes();

        expect(whoisObject.isPresent()).toEqual(true);
        expect(attributes.count()).toEqual(15);
        expect(attributes.get(0).getText()).toEqual('inet6num:        2001:7f8::/29');
        expect(attributes.get(1).getText()).toEqual('netname:         EU-ZZ-2001-07F8');
        expect(attributes.get(2).getText()).toEqual('org:             ORG-NCC1-RIPE');
        expect(attributes.get(3).getText()).toEqual('descr:           RIPE Network Coordination Centre');
        expect(attributes.get(4).getText()).toEqual('descr:           block for RIR assignments');
        expect(attributes.get(13).getText()).toEqual('last-modified:   2011-12-30T07:49:39Z');
        expect(attributes.get(14).getText()).toEqual('source:          RIPE');
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
