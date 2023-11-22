export class EmailConfirmationPage {
    visit(confirmationStatus: string) {
        cy.visit(`confirmEmail?t=${confirmationStatus}`);
        return this;
    }

    expectCheckImagePresent() {
        cy.get('.fa-check').should('exist');
        return this;
    }

    expectExclamationImagePresent() {
        cy.get('.fa-exclamation-circle').should('exist');
        return this;
    }

    expectEmailConfirmationMsgToContain(text: string) {
        cy.get('email-confirmation h2').should('contain.text', text);
        return this;
    }
}
