/*global beforeEach, browser, describe, expect, it, require */

'use strict';

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The password authentication dialogue', function () {

    beforeEach(function () {
        browser.get('#/webupdates/modify/ripe/aut-num/AS9191');
    });

    it('should show a single modal which asks for a password', function () {
        expect(page.modalBtnSubmit.isPresent()).toEqual(true);
        expect(page.modalInpMaintainer.getText()).toEqual('NEWNET-MNT');
        page.modalClose.click();
        expect(page.modal.isPresent()).toEqual(false);
    });

    it('should be able to show massive objects', function () {
        // i'm unhappy with this test. it should be able to detect if an element is visible or not
        expect(page.allObjectRows.count()).toEqual(395);
        expect(page.allObjectRows.get(394).isPresent()).toEqual(true);
        expect(page.allObjectRows.get(2).isDisplayed()).toEqual(true);
        expect(page.allObjectRows.get(394).isDisplayed()).toEqual(true);
        page.scrollIntoView(page.btnDeleteObject);
        expect(page.allObjectRows.get(2).isDisplayed()).toEqual(true);
        expect(page.allObjectRows.get(394).isDisplayed()).toEqual(true);
        expect(page.allObjectRows.get(794).isDisplayed()).toEqual(true);
        expect(page.allObjectRows.get(794).isPresent()).toEqual(true);
        expect(page.allObjectRows.count()).toEqual(795);
    });

});
