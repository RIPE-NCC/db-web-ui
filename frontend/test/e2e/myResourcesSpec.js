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

    it('should show always Sponsores Resources tab after switching organisation without sponsored resources', function () {
        page.scrollIntoView(page.tabsMySponsoredResources);
        page.tabSponsoredResources.click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('Sponsored Resources');
        page.scrollIntoView(page.orgSelector);
        page.orgSelector.click();
        // switch selected org to Viollier AG
        page.orgSelectorOptions3.click();
        page.scrollIntoView(page.tabsMySponsoredResources);
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain('Sponsored Resources');
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

    it('should hide ... button for selected not LIR organisation', function () {
        page.orgSelector.click();
        //selected Swi Rop Gonggrijp - ORG
        page.orgSelectorOptions2.click();
        expect(page.btnTransfer.isPresent()).toEqual(false);
        //selected SURFnet bv - LIR
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

    it('should show ip usage for all IPv4 resources', function () {
        expect(page.resourcesIpUsage.isPresent()).toBeTruthy();
        expect(page.resourcesIpUsage.count()).toEqual(3);
        expect(page.resourcesIpUsage.get(0).getText()).toEqual("Total allocated: 3072");
        expect(page.resourcesIpUsage.get(1).getText()).toEqual("Total allocated used: 2048");
        expect(page.resourcesIpUsage.get(2).getText()).toEqual("Total allocated free: 1024");
    });

    it('should show ip usage for all IPv6 resources', function () {
        page.myResourcesTabs.get(1).click();
        expect(page.resourcesIpUsage.isPresent()).toBeTruthy();
        expect(page.resourcesIpUsage.count()).toEqual(3);
        expect(page.resourcesIpUsage.get(0).getText()).toEqual("Total allocated subnets: 64K");
        expect(page.resourcesIpUsage.get(1).getText()).toEqual("Total allocated subnets used: 0");
        expect(page.resourcesIpUsage.get(2).getText()).toEqual("Total allocated subnets free: 64K");
    });

    it('should show ip usage for asn', function () {
        page.myResourcesTabs.get(2).click();
        expect(page.resourcesIpUsage.isPresent()).toBeFalsy();
    });

    it('should not show ip usage for sponsored tabs', function () {
        page.tabSponsoredResources.click();
        page.myResourcesTabs.get(0).click();
        expect(page.resourcesIpUsage.isPresent()).toBeFalsy();
    });

});
