export class SyncupdatesPage {
    visit() {
        cy.visit('syncupdates');
        return this;
    }

    typeSyncupdateString(text: string) {
        cy.get('#rpslTextArea').clear().type(text);
        return this;
    }

    clickOnUpdateButton() {
        cy.get('button[name="btnSyncupdate"]').click();
        return this;
    }

    expectDisabledSubmitButton(disabled: boolean) {
        cy.get('button[name="btnSyncupdate"]').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectPreviewSyncupdatesShown(shown: boolean) {
        cy.get('#updateResultPreview').should(shown ? 'exist' : 'not.exist');
        return this;
    }

    expectPreviewSyncupdatesToContain(text: string) {
        cy.get('#updateResultPreview').should('contain.text', text);
        return this;
    }

    expectSyncupdatesInstructionsPresent() {
        cy.get('#instructionsSyncupdate').should('exist');
        return this;
    }

    expectSyncupdatesInstructionsText(text: string) {
        cy.get('#instructionsSyncupdate').should('contain.text', text);
        return this;
    }

    expectErrorOnTextArea(text: string) {
        cy.get(`.text-error`).should('contain.text', text);
        return this;
    }
}
