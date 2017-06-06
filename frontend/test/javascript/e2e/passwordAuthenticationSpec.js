/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The password authentication dialogue', function () {

    'use strict';

    beforeEach(function () {
        browser.get('#/webupdates/modify/ripe/aut-num/AS9191');
    });

    it('should show a single modal which asks for a password', function () {
        expect(page.modalBtnSubmit.isPresent()).toEqual(true);
        expect(page.modalInpMaintainer.getText()).toEqual('NEWNET-MNT');
        page.modalClose.click();
        expect(page.modal.isPresent()).toEqual(false);
    });

});
