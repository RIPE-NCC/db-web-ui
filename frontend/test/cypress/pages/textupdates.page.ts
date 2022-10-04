export class TextupdatesPage {
    visit(url: string) {
        cy.visit(`textupdates/${url}`);
        return this;
    }

    expectDeleteButtonToExist(exist: boolean) {
        cy.get('.red-button').should(exist ? 'exist' : 'not.exist');
        return this;
    }
}
