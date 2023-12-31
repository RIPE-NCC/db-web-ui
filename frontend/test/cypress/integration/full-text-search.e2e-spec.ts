import { FullTextSearchPage } from '../pages/fulltext-search.page';

describe('The full text search', () => {
    const fullTextSearchPage = new FullTextSearchPage();
    const personAuthError = './test/e2e/mocks/e2eTest/person-auth-error.json';
    const personCreation = './test/e2e/mocks/e2eTest/d7ae9b71eb48edb1ed1bb684fb8c615ac6f1c7ee.json';

    beforeEach(() => {
        fullTextSearchPage.visit();
    });

    it('should be able to search using the text box', () => {
        fullTextSearchPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().expectNumberOfResults(7).expectValueInSearchField('193.0.0.0');
    });

    it('should warning message when no results of search', () => {
        fullTextSearchPage
            .typeSearchTerm('nemam')
            .clickOnSearchButton()
            .expectWarningMessage('No results were found for your search. Your search details may be too selective.');
    });

    it('should be able to add a filter by clicking on summar', () => {
        fullTextSearchPage
            .typeSearchTerm('193.0.0.0')
            .clickOnSearchButton()
            .expectNumberOfResults(7)
            .expectValueInSearchField('193.0.0.0')
            .expectValueInNthResult(0, 'inetnum', true)
            .clickOnNthResult(0)
            .expectNumberOfResults(3);
    });

    it('should be able to search using advanced options', () => {
        fullTextSearchPage
            .typeSearchTerm('193.0.0.0 ripe')
            .clickOnSearchButton()
            .clickOnAdvanceSearchOption()
            .clickOnAdvancedTypeAllSelected()
            .clickOnSearchButton()
            .expectNumberOfResults(7)
            .clickOnAdvancedTypeAnySelected()
            .clickOnSearchButton()
            .expectNumberOfResults(10)
            .clickOnAdvancedTypeExactSelected()
            .clickOnSearchButton()
            .expectNumberOfResults(0);
    });

    it('should sanitized img and script tag - XSS attack', () => {
        fullTextSearchPage.typeSearchTerm('Jamesits').clickOnSearchButton().expectValueInNthResult(0, '<img', false).expectValueInNthResult(0, 'script', false);
    });

    it('should show version of whois after searching', () => {
        fullTextSearchPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().expectVersionToBe('RIPE Database Software Version 1.97-SNAPSHOT');
    });

    it('should show a banner if error', () => {
        fullTextSearchPage
            .typeSearchTerm('Bad Entry')
            .clickOnSearchButton()
            .expectErrorMessage('Error performing search query. Please review the terms and try again');
    });
});
