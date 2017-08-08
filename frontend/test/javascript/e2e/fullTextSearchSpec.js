/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The full text search', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/fulltextsearch');
    });

    it('should be able to search using the text box', function () {
        page.byId('fullTextSearchInput').sendKeys('193.0.0.0');
        page.byId('fullTextSearchButton').click();
        expect(page.fullTextSearchResults.count()).toEqual(7);
        expect(page.byId('fullTextSearchInput').getAttribute('value')).toEqual('193.0.0.0');
    });

    it('should be able to add a filter by clicking on summary', function () {
        page.byId('fullTextSearchInput').sendKeys('193.0.0.0');
        page.byId('fullTextSearchButton').click();
        expect(page.fullTextSearchResults.count()).toEqual(7);
        expect(page.fullTextResultSummaryRow.get(0).getText()).toContain('inetnum');
        page.scrollIntoView(page.fullTextResultSummaryRow.get(0));
        page.fullTextResultSummaryRow.get(0).click(); // click on 'inetnum'
        expect(page.fullTextSearchResults.count()).toEqual(3);
    });

    it('should be able to search using advanced options', function () {
        page.byId('fullTextSearchInput').sendKeys('193.0.0.0 ripe');
        page.byId('fullTextAdvanceModeLink').click();

        expect(page.byId('fullTextAdvancedTypeAll').isPresent()).toEqual(true);
        page.scrollIntoView(page.byId('fullTextSearchButton'));
        page.byId('fullTextSearchButton').click();
        expect(page.fullTextSearchResults.count()).toEqual(7);

        page.scrollIntoView(page.byId('fullTextAdvancedTypeAny'));
        page.byId('fullTextAdvancedTypeAny').click();
        page.scrollIntoView(page.byId('fullTextSearchButton'));
        page.byId('fullTextSearchButton').click();
        expect(page.fullTextSearchResults.count()).toEqual(10);

        page.scrollIntoView(page.byId('fullTextAdvancedTypeExact'));
        page.byId('fullTextAdvancedTypeExact').click();
        page.scrollIntoView(page.byId('fullTextSearchButton'));
        page.byId('fullTextSearchButton').click();
        expect(page.fullTextSearchResults.count()).toEqual(0);
    });

});
