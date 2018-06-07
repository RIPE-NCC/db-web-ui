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

    it('should show the remarks field starting with hash (#)', function () {
        expect(page.lookupPageObjectLi.get(5).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(4).getText()).toContain('#comments starting with hash');
    });

    it('should show comment behind value starting with hash (#)', function () {
        expect(page.lookupPageObjectLi.get(2).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(2).getText()).toContain('IPv4 address block not managed by the RIPE ibihvjg #test shown comment');
    });
});
