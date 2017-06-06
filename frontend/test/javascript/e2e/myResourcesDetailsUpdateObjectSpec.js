/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');


describe('My Resources, update object', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('should react on the update button', function() {

        page.scrollIntoView(page.btnUpdateObjectButton);

        page.btnUpdateObjectButton.click();
        page.modalInpPassword.sendKeys('TPOL888-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpDescr.isPresent()).toBe(true);
        page.scrollIntoView(page.inpDescr);
        page.inpDescr.sendKeys('Updated test description');
        page.scrollIntoView(page.btnSubmitObject);
        page.btnSubmitObject.click();
        expect(page.successMessage.isPresent()).toBe(true);
    });

});
