/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');


describe('My Resources, update object', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl+ '#/webupdates/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('should react on the update button', function() {
        var whoisObject = page.getWhoisObject();
        page.btnUpdateObjectButton.click();
        page.modalInpPassword.sendKeys('TPOL888-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpDescr.isPresent()).toBe(true);
        page.scrollIntoView(page.inpDescr);
        page.inpDescr.sendKeys("Updated test description");
        page.btnSubmitObject.click();

        expect(page.successMessage.isPresent()).toBe(true);        
    });

});
