/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The domain wizard', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '/#/webupdates/wizard/RIPE/domain');
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should show an editor for domain', function() {
        expect(page.heading.getText()).toEqual('Create "domain" objects');
        expect(page.inpPrefix.isPresent()).toEqual(true);
        expect(page.inpNserver1.isPresent()).toEqual(false);
        expect(page.inpNserver2.isPresent()).toEqual(false);
        expect(page.inpAdminC4.isPresent()).toEqual(false);

        page.inpPrefix.sendKeys('33.33.33.0/8');
        expect(page.inpNserver1.isPresent()).toEqual(true);
        expect(page.inpNserver2.isPresent()).toEqual(true);
        expect(page.inpAdminC4.isPresent()).toEqual(false);

        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(function() {
            return browser.isElementPresent(page.inpAdminC4);
        }, 3000);
        expect(page.inpAdminC4.isPresent()).toEqual(true);
    });

});
