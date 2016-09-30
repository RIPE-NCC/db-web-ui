/*global beforeEach, browser, describe, expect, inject, it, require */

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
        //browser.executeScript("document.body.className += ' notransition';");
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        // inject(function ($injector) {
        //     $injector.get('$animate').enabled(false);
        // });
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should show an editor for domain', function() {
        expect(page.heading.getText()).toEqual('Create "domain" objects');
        expect(page.inpPrefix.isDisplayed()).toEqual(true);
        expect(page.inpNserver1.isDisplayed()).toEqual(false);
        expect(page.inpNserver2.isDisplayed()).toEqual(false);
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
    });

    it('should show an editor for domain which accepts a prefix and nameservers', function() {
        page.inpPrefix.sendKeys('33.33.33.0/8');
        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(browser.isElementPresent(page.inpAdminC4), 3000);
        expect(page.inpAdminC4.isPresent()).toEqual(true);
        expect(page.inpTechC5.isPresent()).toEqual(true);
        expect(page.inpZoneC6.isPresent()).toEqual(true);
    });

});
