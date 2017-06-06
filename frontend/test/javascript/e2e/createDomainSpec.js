/*global beforeEach, browser, by, describe, expect, it, protractor, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The domain wizard', function () {

    'use strict';

    beforeEach(function () {
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
        page.inpPrefix.sendKeys('212.17.110.0/23');

        browser.driver.wait(protractor.until.elementIsVisible(page.inpNserver1));

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
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });


    it('should show a domain creation form for IPv6 which rejects invalid nameservers', function() {
        page.modalSplashBtn.click();
        //page.scrollIntoView(page.inpPrefix);
        browser.driver.wait(protractor.until.elementIsVisible(page.inpPrefix));
        page.inpPrefix.sendKeys('2001:db8::/48');
        browser.driver.wait(protractor.until.elementIsVisible(page.inpNserver1));

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

        expect(liContainer.getText()).toContain('0.8.b.d.0.1.0.0.2.ip6.arpa');
        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(1);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);

        // User changes his mind!
        page.inpPrefix.sendKeys('212.17.110.0/23');
        browser.wait(function() {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);
        expect(liContainer.getText()).not.toContain('0.8.b.d.0.1.0.0.2.ip6.arpa');

    });

    it('should show a popup when a prefix is submitted', function() {

        page.modalSplashBtn.click();
        //page.scrollIntoView(page.inpPrefix);
        page.inpPrefix.sendKeys('212.17.110.0/23');
        browser.driver.wait(protractor.until.elementIsVisible(page.inpNserver1));

        page.inpNserver1.sendKeys('rns1.upc.biz');
        page.inpNserver2.sendKeys('rns2.upc.biz');

        browser.driver.wait(protractor.until.elementIsVisible(page.inpAdminC4));

        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        expect(page.inpAdminC4.sendKeys('LG1-RIPE'));
        expect(page.inpTechC5.sendKeys('LG1-RIPE'));
        expect(page.inpZoneC6.sendKeys('LG1-RIPE'));

        page.scrollIntoView(page.btnSubmitForm);

        page.btnSubmitForm.click();
    });

});
