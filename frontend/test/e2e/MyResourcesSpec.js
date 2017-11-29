/*global beforeEach, browser, by, describe, element, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('My resources', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/myresources/overview');
    });

    it('should show IPv4 resources for an LIR', function () {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.myResourcesActiveTabLabel.getText()).toContain('IPv4');
        expect(page.myResourcesActiveTabRows.count()).toBe(4);
        expect(page.myResourcesActiveTabRows.get(0).getText()).toContain('194.104.0.0/24');
        expect(page.myResourcesActiveTabRows.get(1).getText()).toContain('194.171.0.0/16');
        expect(page.myResourcesActiveTabRows.get(2).getText()).toContain('195.169.0.0/16');
        expect(page.myResourcesActiveTabRows.get(3).getText()).toContain('192.87.0.0/16');
    });

    it('should show progressbar for IPv4 resources with status ALLOCATED PA', function () {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.progressbarFromResourceItem(1).isPresent()).toEqual(true);
    });

    it('should hide progressbar for IPv4 resources with status ASSIGNED PI', function () {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.progressbarFromResourceItem(0).isPresent()).toEqual(false);
    });

    it('should show sponsored IPv4 resources', function () {
        page.scrollIntoView(page.btnToggleSponsoredResources);
        expect(page.btnToggleSponsoredResources.getText()).toContain('Switch to Sponsored Resources');
        // switch to Sponsored Resources
        page.btnToggleSponsoredResources.click();
        expect(page.myResourcesActiveTabLabel.getText()).toContain('IPv4');
        expect(page.myResourcesActiveTabRows.count()).toBe(42);
        expect(page.btnToggleSponsoredResources.getText()).toContain('Switch to My Resources');
        // switch back to My Resources
        page.scrollIntoView(page.btnToggleSponsoredResources);
        page.btnToggleSponsoredResources.click();
    });

    it('should show not sponsores resources after switching organisation without sponsored resources', function () {
        page.scrollIntoView(page.btnToggleSponsoredResources);
        page.btnToggleSponsoredResources.click();
        expect(page.myResourcesActiveTabLabel.getText()).toContain('IPv4');
        page.scrollIntoView(page.orgSelector);
        page.orgSelector.click();
        // switch selected org to Viollier AG
        page.orgSelectorOptions2.click();
        page.scrollIntoView(page.btnToggleSponsoredResources);
        expect(page.btnToggleSponsoredResources.isDisplayed()).toEqual(false);
    });

});
