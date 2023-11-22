export class NotFoundPage {
    visit() {
        cy.visit('not-found');
        return this;
    }

    clickButtonNavigateToSearch() {
        cy.get('#btnNavigateToQuery').click();
        return this;
    }

    clickButtonNavigateToCreate() {
        cy.get('#btnNavigateToCreate').click();
        return this;
    }
}
