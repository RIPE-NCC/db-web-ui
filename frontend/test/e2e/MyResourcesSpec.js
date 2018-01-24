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
        page.scrollIntoView(page.tabsMySponsoredResources);
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('My Resources');
        // switch to Sponsored Resources
        page.tabSponsoredResources.click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('Sponsored Resources');
        expect(page.myResourcesActiveTabRows.count()).toBe(42);
        // switch back to My Resources
        page.scrollIntoView(page.tabsMySponsoredResources);
        page.tabMyResources.click();
    });

    it('should show not sponsores resources after switching organisation without sponsored resources', function () {
        page.scrollIntoView(page.tabsMySponsoredResources);
        page.tabSponsoredResources.click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('Sponsored Resources');
        page.scrollIntoView(page.orgSelector);
        page.orgSelector.click();
        // switch selected org to Viollier AG
        page.orgSelectorOptions2.click();
        page.scrollIntoView(page.tabsMySponsoredResources);
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('My Resources');
        page.orgSelector.click();
        // switch back selected org to SURFnet
        page.orgSelectorOptions0.click();
    });

});
