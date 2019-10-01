/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Display an aut-num', function () {

    'use strict';


    beforeEach(function () {
        browser.get(browser.baseUrl + '#/webupdates/display/RIPE/aut-num/as210089?method=Modify');
    });

    it('should sanitized img and script tag - XSS attack', function () {
        expect(browser.getCurrentUrl()).toContain('#/webupdates/display/RIPE/aut-num/as210089?method=Modify');
        expect(page.successMessage.getText()).toEqual('Your object has been successfully modified');
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
        expect(page.displayPanel.getText()).not.toContain("<img");
        expect(page.displayPanel.getText()).not.toContain("script");
    });
});
