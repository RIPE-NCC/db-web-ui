/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The route editor', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
    });

    it('should create new route object', function () {
        page.selectObjectType('route').click();
        page.btnNavigateToCreate.click();
        page.inpRoute.sendKeys('211.43.192.0/19');
        // submit button shouldn't be available
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeTruthy();
        page.scrollIntoView(page.inpOrigin);
        page.inpOrigin.sendKeys('AS9777');

        expect(page.inpSource.getAttribute('value')).toEqual('RIPE');
        expect(page.inpSource.getAttribute('disabled')).toBeTruthy();
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeFalsy();
    });

});
