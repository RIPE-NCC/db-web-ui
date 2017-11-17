/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
const page = require('./homePageObject');

/*
 * Tests...
 */
describe('Live chat button', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + "#/myresources/overview?type=inetnum");
    });

    it('should be possible to hide / show Live Chat button', function () {
        //selected SURFnet bv - LIR
        expect(page.orgSelector.isPresent()).toEqual(true);
        expect(page.liveChatButtonTab.isDisplayed()).toEqual(true);
        page.orgSelector.click();
        //selected Swi Rop Gonggrijp - ORG
        page.orgSelectorOptions1.click();
        expect(page.liveChatButtonTab.isDisplayed()).toEqual(false);
        page.orgSelector.click();
        //selected SURFnet bv - LIR
        page.orgSelectorOptions0.click();
        expect(page.liveChatButtonTab.isDisplayed()).toEqual(true);
    });
});
