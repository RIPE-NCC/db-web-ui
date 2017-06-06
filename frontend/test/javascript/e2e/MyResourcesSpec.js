/*global beforeEach, browser, by, describe, element, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('My resources', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/webupdates/myresources/overview');
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

    it('should show sponsored IPv4 resources', function () {
        page.scrollIntoView(page.btnToggleSponsoredResources);
        page.btnToggleSponsoredResources.click();
        expect(page.myResourcesActiveTabLabel.getText()).toContain('IPv4');
        expect(page.myResourcesActiveTabRows.count()).toBe(42);
    });

});
