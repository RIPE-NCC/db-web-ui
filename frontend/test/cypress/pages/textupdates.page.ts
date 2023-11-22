export class TextupdatesPage {
    visit(url: string) {
        cy.visit(`textupdates/${url}`);
        return this;
    }

    expectDeleteButtonToExist(exist: boolean) {
        cy.get('button:contains("DELETE THIS OBJECT")').should(exist ? 'exist' : 'not.exist');
        return this;
    }
}
