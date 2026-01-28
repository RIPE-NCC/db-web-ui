export class ApiKeysPage {
    visit() {
        cy.visit('api-keys');
        return this;
    }

    expectTableToContain(text: string) {
        cy.get('table').should('contain.text', text);
        return this;
    }

    createApiKey(label: string, expiresAt: string, maintainers: string[]) {
        this.toggleAccordion();
        this.getInput('Key name').clear().type(label);
        this.getInput('Expiration date').clear().type(expiresAt);
        this.getInput('Maintainer').clear().type(maintainers[0]);
        cy.get('button:contains("Create a key")').click();
        return this;
    }

    revokeKey(id: string) {
        cy.get(`button[data-test-id="${id}"]`).click();
        return this;
    }

    expectCreatedKeyDialogToBePresent() {
        cy.get('mat-dialog-container').should('exist');
        cy.get('mat-dialog-container').should('contain.text', 'Your Database Key');
        return this;
    }

    expectRevokeKeyDialogToBePresent() {
        cy.get('mat-dialog-container').should('exist');
        cy.get('mat-dialog-container').should('contain.text', 'Revoke this key');
        return this;
    }

    addedMultipleMaintainerField() {
        this.toggleAccordion();
        this.clickAddMaintainerButton();
        cy.get(`label:contains("Maintainer")`).should('have.length', 2);
        return this;
    }

    removedMultipleMaintainerField() {
        this.toggleAccordion();
        this.clickRemoveMaintainerButton();
        cy.get(`label:contains("Maintainer")`).should('have.length', 1);
        return this;
    }

    clickAddMaintainerButton() {
        return cy.get(`.fa-circle-plus`).click();
    }

    clickRemoveMaintainerButton() {
        return cy.get(`.fa-circle-minus`).first().click();
    }

    toggleAccordion() {
        cy.get('mat-accordion:contains("Create a new Database key")').click();
        return this;
    }

    private getInput(label: string) {
        return cy.get(`label:contains("${label}") + input`);
    }
}
