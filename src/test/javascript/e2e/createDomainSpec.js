/*global beforeEach, browser, by, describe, expect, inject, it, require */

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
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        //browser.executeScript("document.body.className += ' notransition';");
        browser.get(browser.baseUrl + '/#/webupdates/wizard/RIPE/domain');
    });

    it('should show an editor for domain', function() {
        expect(page.heading.getText()).toEqual('Create "domain" objects');
        expect(page.inpPrefix.isDisplayed()).toEqual(true);
        expect(page.inpNserver1.isDisplayed()).toEqual(false);
        expect(page.inpNserver2.isDisplayed()).toEqual(false);
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
    });

    it('should show an editor for domain which accepts a prefix and nameservers', function() {
        page.inpPrefix.sendKeys('33.33.0.0/17');
        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);

        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });

    it('should show an editor for domain which rejects invalid nameservers', function() {
        page.inpPrefix.sendKeys('33.33.0.0/17');
        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
    });

});
