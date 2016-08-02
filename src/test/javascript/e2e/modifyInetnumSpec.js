/*global beforeEach, browser, describe, expect, it, require */
var mockModule = require('./mocks/inetnummocks');
var page = require('./homePageObject');

describe('Modifying an inetnum', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module);
    });

    it('should prompt for user to add default maintainer in webupdates', function () {
        browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('The default LIR Maintainer has not yet been set up for this object');
    });

    it('should prompt for user to add default maintainer in text updates', function () {
        browser.get(browser.baseUrl + '/#/textupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('The default LIR Maintainer has not yet been set up for this object');
    });

    it('which is an end user assignment should NOT show delete btn', function () {
        browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255');
        expect(page.btnDeleteObject.isPresent()).toBeFalsy();
    });

});
