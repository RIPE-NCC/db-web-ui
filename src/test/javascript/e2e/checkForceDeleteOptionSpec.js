/*global beforeEach, browser, describe, expect, it, require */
var mockModule = require('./mocks/inetnummocks');
var page = require('./homePageObject');

describe('webupdates', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module);
        //Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function (browserLog) {
        //     //    console.log('LOG ' + require('util').inspect(browserLog));
        //     browserLog.forEach(function (log) {
        //         if (log.level.value > 100) {
        //             //console.log('Browser console error!');
        //             console.log(log.level.name + ': ' + log.message);
        //         }
        //     });
        // });
    });

    it('should show "force delete" for an inetnum if NOT allocated by RIPE', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/91.208.34.0-91.208.34.255');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toBe('');
    });

    it('should NOT show "force delete" for an inetnum if allocated by RIPE', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/185.102.172.0-185.102.175.255');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toBe('');
    });

});
