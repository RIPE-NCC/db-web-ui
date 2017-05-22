/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');


describe('My Resources detail for inetnum', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('should show whois object attributes', function() {

        var whoisObject = page.getWhoisObject();
        var attributes = whoisObject.attributes();

        var showMoreButton = whoisObject.showMoreButton();
        expect(showMoreButton.isPresent()).toEqual(false);

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

    it('should show RIPEstat link on whois object page', function() {
        var ripeStateButton = page.getWhoisObject().showRipeStatButton();
        expect(ripeStateButton.isPresent()).toEqual(true);
        var url = ripeStateButton.getAttribute("href");
        expect(url).toEqual("https://stat.ripe.net/192.87.0.0%20-%20192.87.255.255?sourceapp=ripedb");
    });

    it('should display address usage', function() {
        expect(page.usageStatus.isPresent()).toEqual(true);
        expect(page.usageStatusStatistics.count()).toEqual(2);
        expect(page.usageStatusStatistics.get(0).getText()).toEqual('51%');
        expect(page.usageStatusStatistics.get(1).getText()).toEqual('49%');
    });

    it('should list all the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(true);
        expect(page.moreSpecificsTableRows.count()).toEqual(2);

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('192.87.0.0/24');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('LEGACY');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('SNET-HOMELAN');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 3).getText()).toEqual('100%');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('192.87.1.0/24');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('LEGACY');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('NFRA');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 3).getText()).toEqual('100%');
    });

});

describe('My Resources detail for inet6num', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inet6num/2001:7f8::/29/');

    });

    it('should show whois object attributes', function() {

        var whoisObject = page.getWhoisObject();
        var attributes = whoisObject.attributes();

        var showMoreButton = whoisObject.showMoreButton();
        expect(showMoreButton.isPresent()).toEqual(false);


        expect(whoisObject.isPresent()).toEqual(true);
        expect(attributes.count()).toEqual(15);
        expect(attributes.get(0).getText()).toMatch(/inet6num: *2001:7f8::\/29/);
        expect(attributes.get(1).getText()).toMatch(/netname: *EU-ZZ-2001-07F8/);
        expect(attributes.get(2).getText()).toMatch(/org: *ORG-NCC1-RIPE/);
        expect(attributes.get(3).getText()).toMatch(/descr: *RIPE Network Coordination Centre/);
        expect(attributes.get(4).getText()).toMatch(/descr: *block for RIR assignments/);
        expect(attributes.get(13).getText()).toMatch(/last-modified: *2011-12-30T07:49:39Z/);
        expect(attributes.get(14).getText()).toMatch(/source: *RIPE/);
    });

    it('should list all the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(true);
        expect(page.moreSpecificsTableRows.count()).toEqual(2);

        expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('2001:7f8::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('ASSIGNED PI');
        expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('DE-CIX-IXP-20010913');

        expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('2001:7f8:1::/48');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('ASSIGNED PI');
        expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('AMS-IX-20010913');

    });
});


describe('My Resources detail for aut-num', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/aut-num/AS204056/');

    });

    it('should show partial whois object attributes', function() {

        var whoisObject = page.getWhoisObject();
        var attributes = whoisObject.attributes();

        var showMoreButton = whoisObject.showMoreButton();
        expect(showMoreButton.isPresent()).toEqual(true);

        expect(whoisObject.isPresent()).toEqual(true);
        expect(attributes.count()).toEqual(25);
        expect(attributes.get(0).getText()).toMatch(/aut-num: *AS204056/);
        expect(attributes.get(1).getText()).toMatch(/as-name: *asnametest/);
        expect(attributes.get(2).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
        expect(attributes.get(3).getText()).toMatch(/import: *from AS3254 accept ANY/);
        expect(attributes.get(4).getText()).toMatch(/export: *to AS3254 announce AS204056/);
        expect(attributes.get(5).getText()).toMatch(/import: *from as3333 accept ANY/);
        expect(attributes.get(6).getText()).toMatch(/export: *to as3333 announce AS204056/);
        expect(attributes.get(7).getText()).toMatch(/admin-c: *MV10039-RIPE/);
        expect(attributes.get(8).getText()).toMatch(/tech-c: *inty1-ripe/);
        expect(attributes.get(9).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(10).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(11).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(12).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(13).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(14).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(15).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(16).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(17).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(18).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(19).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(20).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(21).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(22).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(23).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(24).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);

    });

    it('should show full whois object attributes', function() {

        var whoisObject = page.getWhoisObject();
        expect(whoisObject.isPresent()).toEqual(true);
        expect(whoisObject.showMoreButton().isPresent()).toEqual(true);

        var attributes = whoisObject.attributes();
        expect(attributes.count()).toEqual(25);

        page.scrollIntoView(whoisObject.showMoreButton());
        whoisObject.showMoreButton().click();
        expect(whoisObject.isPresent()).toEqual(true);
        expect(whoisObject.showMoreButton().isPresent()).toEqual(true);
        expect(attributes.count()).toEqual(50);

        page.scrollIntoView(whoisObject.showMoreButton());
        whoisObject.showMoreButton().click();
        expect(whoisObject.isPresent()).toEqual(true);
        expect(whoisObject.showMoreButton().isPresent()).toEqual(false);
        expect(attributes.count()).toEqual(62);

        expect(attributes.get(0).getText()).toMatch(/aut-num: *AS204056/);
        expect(attributes.get(1).getText()).toMatch(/as-name: *asnametest/);
        expect(attributes.get(2).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
        expect(attributes.get(3).getText()).toMatch(/import: *from AS3254 accept ANY/);
        expect(attributes.get(4).getText()).toMatch(/export: *to AS3254 announce AS204056/);
        expect(attributes.get(5).getText()).toMatch(/import: *from as3333 accept ANY/);
        expect(attributes.get(6).getText()).toMatch(/export: *to as3333 announce AS204056/);
        expect(attributes.get(7).getText()).toMatch(/admin-c: *MV10039-RIPE/);
        expect(attributes.get(8).getText()).toMatch(/tech-c: *inty1-ripe/);
        expect(attributes.get(9).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(10).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(11).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        //Same... :/
        expect(attributes.get(53).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(54).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
        expect(attributes.get(55).getText()).toMatch(/status: *ASSIGNED/);
        expect(attributes.get(56).getText()).toMatch(/mnt-by: *RIPE-NCC-END-MNT/);
        expect(attributes.get(57).getText()).toMatch(/mnt-by: *RU1C-MNT/);
        expect(attributes.get(58).getText()).toMatch(/mnt-routes: *RU1C-MNT/);
        expect(attributes.get(59).getText()).toMatch(/created: *2016-03-22T13:43:48Z/);
        expect(attributes.get(60).getText()).toMatch(/last-modified: *2017-03-23T12:08:46Z/);
        expect(attributes.get(61).getText()).toMatch(/source: *RIPE/);

    });

    it('should NOT list the more specific resources', function () {
        expect(page.moreSpecificsTable.isPresent()).toEqual(false);
    });
});
