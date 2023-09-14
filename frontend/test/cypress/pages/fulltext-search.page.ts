export class FullTextSearchPage {
    visit() {
        cy.visit('fulltextsearch');
        return this;
    }

    typeSearchTerm(term: string) {
        cy.get('#fullTextSearchInput').clear({ force: true }).type(term, { force: true });
        return this;
    }

    clickOnSearchButton() {
        cy.get('#fullTextSearchButton').click({ force: true });
        return this;
    }

    expectValueInSearchField(text: string) {
        cy.get('#fullTextSearchInput').should('have.value', text);
        return this;
    }

    expectNumberOfResults(numberResults: number) {
        cy.get('#resultsAnchor .results').should('have.length', numberResults);
        return this;
    }

    expectWarningMessage(text: string) {
        cy.get('app-banner[level="warning"]').shadow().find('.app-banner.level-warning').should('contain.text', text);
        return this;
    }

    expectErrorMessage(text: string) {
        cy.get('app-banner[level="alarm"]').shadow().find('.app-banner.level-alarm').should('contain.text', text);
        return this;
    }

    expectValueInNthResult(index: number, text: string, contain: boolean) {
        cy.get(`full-text-result-summary tbody tr:nth(${index})`).should(contain ? 'contain.text' : 'not.contain.text', text);
        return this;
    }

    clickOnNthResult(index: number) {
        cy.get(`full-text-result-summary tbody tr:nth(${index})`).click();
        return this;
    }

    clickOnAdvanceSearchOption() {
        cy.get('#fullTextAdvanceModeLink').click({ force: true });
        return this;
    }

    clickOnAdvancedTypeAllSelected() {
        cy.get('#fullTextAdvancedTypeAll').click({ force: true });
        return this;
    }

    clickOnAdvancedTypeAnySelected() {
        cy.get('#fullTextAdvancedTypeAny').click({ force: true });
        return this;
    }

    clickOnAdvancedTypeExactSelected() {
        cy.get('#fullTextAdvancedTypeExact').click({ force: true });
        return this;
    }

    expectVersionToBe(version: string) {
        cy.get('whois-version').should('contain.text', version);
        return this;
    }
}
