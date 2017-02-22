/*global beforeEach, browser, describe, expect, it, require*/
var mockGet = require('./mocks/homemocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
fdescribe('Modifying an organisation', function () {
    'use strict';

    describe('which is an LIR', function () {

        beforeEach(function () {
            browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
            browser.get(browser.baseUrl + '#/webupdates/modify/RIPE/organisation/ORG-AGNS1-RIPE');
        });

        it('should show the mnt-by field as read-only', function () {
            expect(page.inpMaintainer.isPresent()).toEqual(true);
            expect(page.inpMaintainer.getAttribute('disabled')).toBeTruthy();
        });

    });

});
