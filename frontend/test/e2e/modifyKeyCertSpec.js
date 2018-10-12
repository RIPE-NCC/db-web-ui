/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

describe('Modifying an key-cert', function () {

    'use strict';

    beforeEach(function () {
    });

    it('should show error message above certif field', function () {
        browser.get(browser.baseUrl + '#/webupdates/modify/ripe/key-cert/PGPKEY-TESTKEYCERT');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('SYSTEM');
        page.modalInpPassword.sendKeys('SYSTEM');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.inpCertif.isPresent()).toBe(true);
        page.scrollIntoView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        expect(page.inpErrorCertif.isPresent()).toBe(true);
        expect(page.inpErrorCertif.getText()).toBe('The supplied key is revoked');
    });
});
