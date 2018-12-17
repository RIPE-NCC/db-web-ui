/*global beforeEach, browser, by, describe, expect, it, protractor, require */

// Local requires
var page = require('./homePageObject');

var until = protractor.ExpectedConditions;

/*
 * Tests...
 */
describe('The create domain screen', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
        page.selectObjectType('domain').click();
        page.btnNavigateToCreate.click();
    });

    it('should show a domain creation form for IPv4 which rejects invalid nameservers', function () {
        expect(page.modalSplashText.getText()).toEqual('Creating DOMAIN Objects for Reverse DNS');
        page.scrollIntoView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        expect(page.heading.getText()).toEqual('Create "domain" objects');
        expect(page.inpPrefix.isDisplayed()).toEqual(true);
        expect(page.inpNserver1.isDisplayed()).toEqual(false);
        expect(page.inpNserver2.isDisplayed()).toEqual(false);
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);

        page.inpPrefix.sendKeys('212.17.110.0/23\t');
        browser.wait(until.visibilityOf(page.modalBtnSubmit), 5000, 'waited too long');
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalBtnSubmit.click();

        browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function () {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
        expect(page.inpTechC5.isDisplayed()).toEqual(false);
        expect(page.inpZoneC6.isDisplayed()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(function () {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);

        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });


    it('should show a domain creation form for IPv6 which rejects invalid nameservers', function () {
        page.scrollIntoView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        page.inpPrefix.sendKeys('2001:db8::/48');

        //browser.driver.wait(protractor.until.elementIsVisible(page.inpNserver1));
        browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        var liContainer = page.inpNserver2.element(by.xpath('..'));

        browser.wait(function () {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isDisplayed()).toEqual(false);
        expect(page.inpTechC5.isDisplayed()).toEqual(false);
        expect(page.inpZoneC6.isDisplayed()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        browser.wait(function () {
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
        browser.wait(function () {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);
        expect(liContainer.getText()).not.toContain('0.8.b.d.0.1.0.0.2.ip6.arpa');

    });

    it('should show a popup and a nice message on success', function () {
        page.scrollIntoView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        browser.wait(function () {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('212.17.110.0/23\t');
        browser.wait(function () {
            return browser.isElementPresent(page.modalBtnSubmit);
        }, 5000);

        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalBtnSubmit.click();

        browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('rns1.upc.biz');
        page.inpNserver2.sendKeys('rns2.upc.biz');

        // browser.driver.wait(protractor.until.elementIsVisible(page.inpAdminC4));
        browser.wait(until.visibilityOf(page.inpAdminC4), 5000, 'waited too long');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        page.inpAdminC4.sendKeys('LG1-RIPE');
        page.inpTechC5.sendKeys('LG1-RIPE');
        page.inpZoneC6.sendKeys('LG1-RIPE');

        page.scrollIntoView(page.btnSubmitForm);
        page.btnSubmitForm.click();

        page.scrollIntoView(page.modal);
        expect(page.modal.getText()).toContain('Processing your domain objects');
        browser.wait(function () {
            return browser.isElementPresent(page.successMessage);
        }, 5000);
        page.scrollIntoView(page.successMessage);
        expect(page.successMessage.getText()).toContain('object(s) have been successfully created');
    });


    it('should show error messages for invalid prefix', function () {
        page.scrollIntoView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        browser.wait(function () {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('wrong-prefix\t');
        browser.wait(function () {
            return browser.isElementPresent(page.prefixErrMsg);
        }, 5000);
        expect(page.prefixErrMsg.getText()).toContain("Invalid prefix notation");
        page.inpPrefix.clear();
        page.inpPrefix.sendKeys('212.17.110.0/25\t');
        browser.wait(function () {
            return browser.isElementPresent(page.prefixErrMsgLink);
        }, 5000);
        expect(page.prefixErrMsg.getText()).toContain("Please use the Syncupdates page to create a domain object smaller than /24");
        expect(page.prefixErrMsgLink.getAttribute('href')).toContain("#/syncupdates");
    });
});
