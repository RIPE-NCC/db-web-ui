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

});
