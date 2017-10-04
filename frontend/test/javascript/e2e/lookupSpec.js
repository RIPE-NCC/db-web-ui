/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The lookup page', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/lookup?source=RIPE&type=inetnum&key=193.0.0.0%20-%20193.0.0.63');
    });

    it('should be able to show an object', function () {
        expect(page.lookupPageViewer.isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.count()).toEqual(25);
        expect(page.lookupHeader.isPresent()).toEqual(true);
        expect(page.lookupHeader.getText()).toContain('Responsible organisation: Internet Assigned Numbers Authority');
        expect(page.ripeManagedAttributesCheckbox.getText()).toContain('Highlight RIPE NCC managed values');

        page.scrollIntoView(page.byId('showEntireObjectInViewer'));
        page.byId('showEntireObjectInViewer').click();
        expect(page.lookupPageObjectLi.count()).toEqual(35);

    });

});
