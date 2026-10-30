export class WhoisTextEditor {
    expectTextAreaToContain(text: string) {
        cy.get('textarea').should('contain.value', text);
    }
}
