/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The CreateMntnerPairComponent', () => {

    'use strict';

    beforeEach(() => {
        browser.get(browser.baseUrl);
    });

    it('should switch to person maintainer pair page on click on person link', () => {
        page.selectObjectType('role and maintainer pair').click();
        page.btnNavigateToCreate.click();
        expect(browser.getCurrentUrl()).toContain('#/webupdates/create/RIPE/role/self');
        page.switchToPersonObject.click();
        expect(browser.getCurrentUrl()).toContain('#/webupdates/create/RIPE/person/self');
        page.switchToPersonObject.click();
        expect(browser.getCurrentUrl()).toContain('#/webupdates/create/RIPE/role/self');
    });

    it('should show syntax error over person field', () => {
        page.selectObjectType('role and maintainer pair').click();
        page.btnNavigateToCreate.click();
        page.switchToPersonObject.click();
        page.inpMntner.sendKeys('UNA-TEST-MNT');
        page.inpPerson.sendKeys('Üna Švoña');
        page.inpAddress.sendKeys('Utrecht');
        page.inpPhone.sendKeys('+3161234567');
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeTruthy();
        expect(page.prefixErrMsg.getText()).toEqual('Input contains unsupported characters.');
    });
});
