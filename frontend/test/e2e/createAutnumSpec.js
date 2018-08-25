/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The aut-num editor', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
    });

    it('should create new aut-num object', function () {
        page.selectObjectType('aut-num').click();
        page.btnNavigateToCreate.click();
        page.inpAutnum.sendKeys('AS9777');
        // submit button shouldn't be available
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeTruthy();
        page.scrollIntoView(page.inpAsName);
        page.inpAsName.click();
        page.inpAsName.sendKeys('NPIX-AS');
        page.inpAdminC.sendKeys('LG1-RIPE');
        page.inpTechC.sendKeys('LG1-RIPE');

        expect(page.inpSource.getAttribute('value')).toEqual('RIPE');
        expect(page.inpSource.getAttribute('disabled')).toBeTruthy();
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeFalsy();
    });

});
