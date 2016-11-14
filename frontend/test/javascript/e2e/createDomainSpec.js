/*global beforeEach, browser, by, describe, expect, it, require */

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
        browser.executeScript('document.body.className += \' notransition\';');
        browser.get(browser.baseUrl + '#/webupdates/wizard/RIPE/domain');
    });

    it('should display a splash screen', function() {
        expect(page.modalSplashText.getText()).toEqual('Creating DOMAIN Objects for Reverse DNS');
    });

    it('should show an editor for domain', function() {
        page.modalSplashBtn.click();
        expect(page.heading.getText()).toEqual('Create "domain" objects');
        expect(page.inpPrefix.isDisplayed()).toEqual(true);
        expect(page.inpNserver1.isDisplayed()).toEqual(false);
        expect(page.inpNserver2.isDisplayed()).toEqual(false);
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
    });

    it('should show a domain creation form for IPv4 which rejects invalid nameservers', function() {
        page.modalSplashBtn.click();
        page.inpPrefix.sendKeys('33.33.0.0/18');
        browser.wait(function() {
            return browser.isElementPresent(page.inpNserver1);
        }, 5000);
        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
        expect(page.inpTechC5.isDisplayed()).toEqual(false);
        expect(page.inpZoneC6.isDisplayed()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);

        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(128);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });


    it('should show a domain creation form for IPv6 which rejects invalid nameservers', function() {
        page.modalSplashBtn.click();
        page.inpPrefix.sendKeys('2001:db8::/48');
        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
        expect(page.inpTechC5.isDisplayed()).toEqual(false);
        expect(page.inpZoneC6.isDisplayed()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);

        browser.wait(function() {
            return browser.isElementPresent(page.inpReverseZoneTable);
        }, 5000);

        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(1);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });

});
