export class ApiKeysPage {
    visit() {
        cy.visit('api-keys');
        return this;
    }

    expectTableToContain(text: string) {
        cy.get('table').should('contain.text', text);
        return this;
    }

    createApiKey(label: string, expiresAt: string, maintainer: string) {
        this.toggleAccordion();
        this.getInput('Key name').clear().type(label);
        this.getInput('Expiration date').clear().type(expiresAt);
        this.getInput('Maintainer').clear().type(maintainer);
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

    private toggleAccordion() {
        cy.get('mat-accordion:contains("Create a new Database key")').click();
        return this;
    }

    private getInput(label: string) {
        return cy.get(`label:contains("${label}") + input`);
    }
}
