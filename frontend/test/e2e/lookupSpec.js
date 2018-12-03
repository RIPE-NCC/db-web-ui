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
        expect(page.ripeManagedAttributesLabel.getText()).toContain('Highlight RIPE NCC managed values');

        page.scrollIntoView(page.byId('showEntireObjectInViewer'));
        page.byId('showEntireObjectInViewer').click();
        expect(page.lookupPageObjectLi.count()).toEqual(35);

    });

    it('should show the remarks field starting with hash (#)', function () {
        expect(page.lookupPageObjectLi.get(5).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(4).getText()).toContain('# comments starting with hash');
    });

    it('should show comment behind value starting with hash (#)', function () {
        expect(page.lookupPageObjectLi.get(2).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(2).getText()).toContain('IPv4 address block not managed by the RIPE ibihvjg # test shown comment');
    });
});

describe('The lookup page with out of region object from ripe db', function () {
        'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/lookup?source=ripe&key=211.43.192.0%2F19AS9777&type=route');
    });

    it('should be able to show an out of region object from ripe db', function () {
        expect(page.lookupPageViewer.isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.count()).toEqual(7);
        expect(page.lookupHeader.isPresent()).toEqual(false);
        expect(page.btnRipeStat.getAttribute('href')).toEqual('https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb');
        // XML
        expect(page.lookupLinkToXmlJSON.get(0).getAttribute('href')).toContain('/ripe/route/211.43.192.0/19AS9777.xml');
        // JSON
        expect(page.lookupLinkToXmlJSON.get(1).getAttribute('href')).toContain('/ripe/route/211.43.192.0/19AS9777.json');
        // mnt
        expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(3).getAttribute('href')).toContain('?source=RIPE&key=AS4663-RIPE-MNT&type=mntner');
    });
});
