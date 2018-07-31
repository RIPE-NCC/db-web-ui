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
        page.scrollIntoView(page.orgSelector);
        page.orgSelector.click();
        // switch back selected org to SURFnet
        page.orgSelectorOptions0.click();
    });

    it('should show menu item Request resources in ... button for selected LIR organisation', function () {
        expect(page.btnTransfer.isPresent()).toEqual(true);
        page.btnTransfer.click();
        expect(page.transferMenuItems.get(0).getText()).toContain('Transfer resources');
        expect(page.transferMenuItems.get(1).getText()).toContain('Request resources');
        page.tabSponsoredResources.click();
        expect(page.btnTransfer.isPresent()).toEqual(true);
        page.btnTransfer.click();
        expect(page.transferMenuItems.get(0).getText()).toContain('Start/stop sponsoring PI resources');
        expect(page.transferMenuItems.get(1).getText()).toContain('Transfer customer\'s resources');
    });

    it('should hide menu item Request resources in ... button for selected not LIR organisation', function () {
        page.orgSelector.click();
        // //selected Swi Rop Gonggrijp - ORG
        page.orgSelectorOptions1.click();
        expect(page.btnTransfer.isPresent()).toEqual(true);
        page.btnTransfer.click();
        expect(page.transferMenuItems.count()).toEqual(1);
        // //selected SURFnet bv - LIR
        page.orgSelector.click();
        page.orgSelectorOptions0.click();
        expect(page.btnTransfer.isPresent()).toEqual(true);
        expect(page.transferMenuItems.count()).toEqual(2);
    });

    it('should show sponsored flag', function () {
        expect(page.myResourcesActiveTabRows.get(3).all(by.css('flag')).get(2).getText()).toEqual('SPONSORED RESOURCE');
    });


    it('should show out of region (RIPE-NONAUTH) autnum', function () {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.myResourcesTabs.count()).toEqual(3);
        page.myResourcesTabs.get(2).click();
        expect(page.myResourcesActiveTabLabel.getText()).toContain('ASN');
        expect(page.myResourcesActiveTabRows.count()).toBe(76);
        // RIPE-NONAUTH item - aut-num which is out of region
        expect(page.myResourcesActiveTabRows.get(75).isPresent()).toBeTruthy();
    });

});
