/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The query pagina', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/query');
    });

    it('should have all its bits on the screen somewhere', function () {
        expect(page.inpQueryString.getAttribute('value')).toEqual('');
        expect(page.inpDontRetrieveRelated.getAttribute('value')).toEqual('on');
        expect(page.inpShowFullDetails.getAttribute('value')).toEqual('on');

        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click(); // nothing should happen, everything is ok
        expect(page.inpQueryString.getAttribute('value')).toEqual('');
        expect(page.inpDontRetrieveRelated.getAttribute('value')).toEqual('on');
        expect(page.inpShowFullDetails.getAttribute('value')).toEqual('on');
    });

    it('should be able to search using the text box', function () {
        page.inpQueryString.sendKeys('193.0.0.0\n'); // press 'enter' for a laugh
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.resultsSection);
        expect(page.searchResults.count()).toEqual(4);
        expect(page.inpQueryString.getAttribute('value')).toEqual('193.0.0.0');
    });

    it('should be able to search using the text box and a type checkbox', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.inpQueryString.getAttribute('value')).toEqual('193.0.0.0');
    });

    it('should be able to have source dynamic', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute('innerHTML')).toContain('?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation');
    });

    it('should be able to have source dynamic', function () {
        page.inpQueryString.sendKeys('223.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute('innerHTML')).toContain('?source=apnic&amp;key=ORG-IANA1-RIPE&amp;type=organisation');
    });

    it('should be specified ripe stat link', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        let ripeStateButtonInetnum = page.getRipeStateFromWhoisObjectOnQueryPage(0);
        page.scrollIntoView(ripeStateButtonInetnum);
        expect(ripeStateButtonInetnum.isPresent()).toEqual(true);
        let urlInet = ripeStateButtonInetnum.getAttribute('href');
        expect(urlInet).toEqual('https://stat.ripe.net/193.0.0.0%20-%20193.0.0.63?sourceapp=ripedb');
        // link for route(6) should contain just route value without AS
        let ripeStateButtonRoute = page.getRipeStateFromWhoisObjectOnQueryPage(3);
        page.scrollIntoView(ripeStateButtonRoute);
        expect(ripeStateButtonRoute.isPresent()).toEqual(true);
        let urlRoute = ripeStateButtonRoute.getAttribute('href');
        expect(urlRoute).toEqual('https://stat.ripe.net/193.0.0.0/21?sourceapp=ripedb');
    });

    it('should be able to show out of region route from ripe db', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
        let nonRipeWhoisObject = page.getWhoisObjectViewerOnQueryPage(2);
        expect(nonRipeWhoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 7).getText()).toEqual('RIPE-NONAUTH');
        expect(page.inpQueryString.getAttribute('value')).toEqual('211.43.192.0');
    });

    it('should be able to show out of region route from ripe db without related objects', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:17'));
        page.byId('search:types:17').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 7).getText()).toEqual('RIPE-NONAUTH');
        expect(page.inpQueryString.getAttribute('value')).toEqual('211.43.192.0');
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute('href')).toEqual('https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb');
    });

    it('should contain ripe-nonauth for source in link on attribute value', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(2, 0).getAttribute('href')).toContain('?source=ripe-nonauth&key=211.43.192.0/19AS9777&type=route');
    });

    it('should be able to show out of region route from ripe db without related objects', function () {
        page.inpQueryString.sendKeys('AS9777');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:2'));
        page.byId('search:types:2').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 0).getAttribute('href')).toContain('?source=ripe-nonauth&key=AS9777&type=aut-num');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 9).getAttribute('href')).toContain('?source=RIPE&key=JYH3-RIPE&type=person');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 10).getAttribute('href')).toContain('?source=RIPE&key=SDH19-RIPE&type=person');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 18).getAttribute('href')).toContain('?source=RIPE&key=AS4663-RIPE-MNT&type=mntner');
        expect(page.inpQueryString.getAttribute('value')).toEqual('AS9777');
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute('href')).toEqual('https://stat.ripe.net/AS9777?sourceapp=ripedb');
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 21).getText()).toEqual('RIPE-NONAUTH');
        // XML
        expect(page.lookupLinkToXmlJSON.get(1).getAttribute('href')).toContain('.xml?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE');
        // JSON
        expect(page.lookupLinkToXmlJSON.get(2).getAttribute('href')).toContain('.json?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE');
    });

});
