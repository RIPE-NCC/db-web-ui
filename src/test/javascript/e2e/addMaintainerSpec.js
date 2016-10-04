/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Adding a maintainer', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
    });

    it('should ask for authentication and add maintainer to mnt-by editor', function () {
        page.selectObjectType('inetnum').click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys('194.242.241.144 - 194.242.241.151');
        page.inpNetname.click();
        page.modalInpPassword.sendKeys('INROMA-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();

    });

});
