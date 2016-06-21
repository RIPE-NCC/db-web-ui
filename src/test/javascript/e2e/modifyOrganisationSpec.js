/*global beforeEach, browser, describe, expect, it*/
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an organisation', function () {
    'use strict';

    describe('which is an LIR', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/organisation/ORG-AGNS1-RIPE');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        it('should show the mnt-by field as read-only', function () {
            expect(page.inpMaintainer.isPresent()).toEqual(true);
            expect(page.inpMaintainer.getAttribute('disabled')).toBeTruthy();
        });

    });

});
