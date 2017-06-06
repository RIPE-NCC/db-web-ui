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
