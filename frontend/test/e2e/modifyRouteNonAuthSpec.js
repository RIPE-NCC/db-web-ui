/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying a resource for a NONAUTH-RIPE route object', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/webupdates/modify/ripe/route/211.43.192.0%252F19AS9777');
    });

    it('should show out of region route object', function () {
        page.modalInpPassword.sendKeys('AS4663-RIPE-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpRoute.getAttribute('disabled')).toBeTruthy();
        expect(page.inpOrigin.getAttribute('disabled')).toBeTruthy();
        expect(page.inpSource.getAttribute('disabled')).toBeTruthy();
        expect(page.inpSource.getAttribute('value')).toEqual('RIPE-NONAUTH');
        expect(page.btnDeleteObject.isPresent()).toBeTruthy();
        page.scrollIntoView(page.btnSubmitModify);
        expect(page.btnSubmitModify.isPresent()).toBeTruthy();
    });

    it('should be possible for RC to submit change on out of region route object', function () {
        page.modalInpPassword.sendKeys('AS4663-RIPE-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        page.scrollIntoView(page.inpDescrCreateForm);
        page.inpDescrCreateForm.sendKeys("update");
        page.scrollIntoView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        expect(browser.getCurrentUrl()).toContain('#/webupdates/display/RIPE/route/211.43.192.0%2F19AS9777?method=Modify');
        expect(page.successMessage.getText()).toEqual('Your object has been successfully modified');
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
    });

    it('should be possible for RC to delete out of region route object', function () {
        page.modalInpPassword.sendKeys('AS4663-RIPE-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        // page.scrollIntoView(page.inpDescrCreateForm);
        page.scrollIntoView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(browser.getCurrentUrl()).toContain('#/webupdates/delete/ripe/route/211.43.192.0%2F19AS9777?onCancel=webupdates%2Fmodify');
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
        expect(page.infoMessage.getText()).toEqual('The following object(s) have been successfully deleted');
    });

    it('should allow force delete on modal-authentication window and navigate to forceDelete', function () {
        expect(page.modal.isPresent()).toEqual(true);
        page.modalInpPassword.sendKeys('AS4663-RIPE-MNT');
        page.modalInpAssociate.click();
        page.modalForceDelete.click();
        expect(browser.getCurrentUrl()).toContain('#/forceDelete/ripe/route/211.43.192.0%2F19AS9777');
        expect(page.modal.isPresent()).toEqual(false);
    });
});
