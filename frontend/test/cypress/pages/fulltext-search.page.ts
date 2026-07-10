export class FullTextSearchPage {
    visit() {
        cy.visit('fulltextsearch');
        return this;
    }

    typeSearchTerm(term: string) {
        cy.get('search-field input').type(term, { force: true });
        return this;
    }

    expectAdvancedTypeAllSelected() {
        cy.get('#fullTextAdvancedTypeAll').should('be.checked');
        return this;
    }

    expectAdvancedTypeAnySelected() {
        cy.get('#fullTextAdvancedTypeAny').should('be.checked');
        return this;
    }

    expectAdvancedTypeExactSelected() {
        cy.get('#fullTextAdvancedTypeExact').should('be.checked');
        return this;
    }

    expectAdvancedSearchOpen(open: boolean) {
        cy.get('#selectedObjectTypes').should(open ? 'exist' : 'not.exist');
        return this;
    }

    expectObjectTypeSelected(type: string) {
        cy.get('#selectedObjectTypes option:selected').should('contain.text', type);
        return this;
    }

    selectObjectType(type: string) {
        cy.get('#selectedObjectTypes').select(type, { force: true });
        return this;
    }

    clickOnSearchButton() {
        cy.get('search-field button .fa-magnifying-glass').click({ force: true });
        return this;
    }

    expectValueInSearchField(text: string) {
        cy.get('search-field input').should('have.value', text);
        return this;
    }

    expectNumberOfResults(numberResults: number) {
        cy.get('#resultsAnchor .results').should('have.length', numberResults);
        return this;
    }

    expectWarningMessage(text: string) {
        cy.get('banner .warning-banner').should('contain.text', text);
        return this;
    }

    expectErrorMessage(text: string) {
        cy.get('banner .error-banner').should('contain.text', text);
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
