/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The organisation drop-down box', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/myresources/overview');
    });

    it('should be shown when a user has an LIR', function () {
        expect(page.orgSelector.isPresent()).toEqual(true);
        page.orgSelector.click();

        expect (page.orgSelectorOptions.count()).toBe(5);
    });

    it('should be ordered members and the end users organisations sorted alphabetically by name', function () {
        page.orgSelector.click();
        expect (page.orgSelectorOptions.isPresent()).toEqual(true);
        // member
        expect (page.orgSelectorOptions.get(0).getText()).toEqual("nl.surfnet");
        expect (page.orgSelectorOptions0.getText()).toContain("SURFnet bv");
        expect (page.orgSelectorOptions.get(1).getText()).toEqual("nl.abelohost3");
        expect (page.orgSelectorOptions1.getText()).toContain("Westernunion");
        // end users organisations
        expect (page.orgSelectorOptions.get(2).getText()).toEqual("ORG-WA56-RIPE");
        expect (page.orgSelectorOptions2.getText()).toContain("Swi Rop Gonggrijp");
        expect (page.orgSelectorOptions.get(3).getText()).toEqual("ORG-VA397-RIPE");
        expect (page.orgSelectorOptions3.getText()).toContain("Viollier AG");
    });
});
