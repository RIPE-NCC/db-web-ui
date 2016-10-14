/*global beforeEach, browser, describe, expect, it, require */
var mockGet = require('./mocks/homemocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an aut-num', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/aut-num/AS12467');
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
    });

    describe('which DOES NOT have status APPROVED PI', function () {

        it('should show sponsoring-org as read-only', function () {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeFalsy();
        });

    });

    describe('which has status APPROVED PI', function () {

        it('should not allow sponsoring-org to be added', function () {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            page.iimPlay('TAG POS=1 TYPE=SPAN ATTR=CLASS:fa<SP>fa-plus&&TXT:');

            expect(page.modal.isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, 'descr').isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, 'sponsoring-org').isPresent()).toEqual(false);
        });

    });

});
