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
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/194.219.52.224%20-%20194.219.52.239');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toContain('Force delete this object?');
    });

    it('should NOT show "force delete" for an inetnum if allocated by RIPE', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/91.208.34.0%20-%2091.208.34.255');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toBe('');
    });

    it('should NOT show "force delete" for an inetnum if allocated by RIPE and no extra mntners', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/185.102.172.0%20-%20185.102.175.255');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain('The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.');
        expect(page.modalFooter.getText()).toBe('');
    });

    it('should NOT show "force delete" for an inetnum if allocated by RIPE and no mntners have a passwd', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inetnum/186.102.172.0%20-%20186.102.175.255');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain('You cannot modify this object here because none of the maintainers are protected with a password.');
        expect(page.modalFooter.getText()).toBe('');
    });

    it('should show "force delete" for an inet6num if NOT allocated by RIPE', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inet6num/2001%253A978%253Affff%253Afffe%253A%253A%252F64');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toContain('Force delete this object?');
    });

    it('should NOT show "force delete" for an inet6num if allocated by RIPE and no mntners have a passwd', function () {
        browser.get(browser.baseUrl + '/#/webupdates/display/ripe/inet6num/2001%253Aa08%253A%253A%252F32');
        expect(page.btnModify.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain('The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.');
        expect(page.modalFooter.getText()).toBe('');
    });

});
