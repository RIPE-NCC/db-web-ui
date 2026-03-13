export class FeedbackSupportPage {
    visit() {
        cy.visit('query');
        return this;
    }

    clickBurgerMenu() {
        cy.get('ripe-header').shadow().find('#burger-menu').click();
        return this;
    }

    clickFeedbackSupportMenuItem() {
        cy.get('ripe-unified-layout').find('a:contains("Feedback/Support")').click();
        return this;
    }

    expectDialogTitle(title: string) {
        cy.get('.feedback-support-panel mat-dialog-container h2').should('contain.text', title);
        return this;
    }

    expectNumberOfItemsInDialog(numberOfItems: number) {
        cy.get('.feedback-support-panel mat-dialog-container mat-list-item').should('have.length', numberOfItems);
        return this;
    }

    expectItemOnPositionToContainText(position: number, text: string) {
        cy.get(`.feedback-support-panel mat-dialog-container mat-list-item:nth(${position})`).should('contain.text', text);
        return this;
    }
}
