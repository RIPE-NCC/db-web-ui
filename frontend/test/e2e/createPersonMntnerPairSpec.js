/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The CreatePersonMntnerPairController', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
    });

    it('should show syntax error over person field', function () {
        page.selectObjectType('person and maintainer pair').click();
        page.btnNavigateToCreate.click();
        page.inpMntner.sendKeys('UNA-TEST-MNT');
        page.inpPerson.sendKeys('Üna Švoña');
        page.inpAddress.sendKeys('Utrecht');
        page.inpPhone.sendKeys('+3161234567');
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeTruthy();
        expect(page.prefixErrMsg.getText()).toEqual('Input contains unsupported characters.');
    });
});
