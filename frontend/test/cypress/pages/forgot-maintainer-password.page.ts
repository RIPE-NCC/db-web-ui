export class ForgotMaintainerPasswordPage {
    visit() {
        cy.visit(`fmp`);
        return this;
    }

    visitFmpWithQueryParam(username: string) {
        cy.visit(`fmp?mntnerKey=${username}`);
        return this;
    }

    visitChangeAuth(mntnerKey: string, voluntary: boolean) {
        cy.visit(`fmp/change-auth?mntnerKey=${mntnerKey}&voluntary=${voluntary}`);
        return this;
    }

    getFindMaintainerForm() {
        return new FindMaintainerForm();
    }

    getManualRecoveryProcessForm() {
        return new ManualRecoveryProcessForm();
    }
}

class FindMaintainerForm {
    expectFindMaintainerFormShown() {
        cy.get('#find-maintainer').should('exist');
        return this;
    }

    expectSearchMaintainerInputFieldShown() {
        cy.get('[name=maintainerKey]').should('exist');
        return this;
    }

    expectValueInMaintainerInputField(mntnerName: string) {
        cy.get('[name=maintainerKey]').should('contain.value', mntnerName);
        return this;
    }

    typeMaintainerToSearchMaintainerInputField(reasonText: string) {
        cy.get('[name=maintainerKey]').clear().type(reasonText);
        return this;
    }

    expectSearchMaintainerButtonShown() {
        cy.get('#search-maintainer').should('exist');
        return this;
    }

    clickSearchMaintainerButton() {
        cy.get('#search-maintainer').click();
        return this;
    }

    expectCancelButtonShown() {
        cy.get('#search-cancel').should('exist');
        return this;
    }

    expectMaintainerContainerPresent(exist: boolean) {
        cy.get('#maintainer-container').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectMaintainerContainerContainText(text: string) {
        cy.get('#maintainer-container').should('contain.text', text);
        return this;
    }

    expectErrorAlert(shown: boolean) {
        cy.get('app-banner[level="alarm"]').should(shown ? 'exist' : 'not.exist');
        return this;
    }
}

class ManualRecoveryProcessForm {
    expectFormDescriptionText(text: string) {
        cy.get('[name="fmpform"]').should('contain.text', text);
        return this;
    }

    expectReasonFieldToExist() {
        cy.get('#reason').should('exist');
        return this;
    }

    expectEmailFieldToExist() {
        cy.get('#email').should('exist');
        return this;
    }

    expectNextButtonToExist() {
        cy.get('#next').should('exist');
        return this;
    }

    clickNextButton() {
        cy.get('#next').click();
        return this;
    }

    typeReason(reasonText: string) {
        cy.get('#reason').clear().type(reasonText);
        return this;
    }

    typeEmail(email: string) {
        cy.get('#email').clear().type(email);
        return this;
    }

    expectReasonNotLongerThen1000Characters() {
        cy.get('#reason').should('have.attr', 'maxlength', 1000);
        return this;
    }

    getRequestMntPasswordConfirmationForm() {
        return new RequestMntPasswordConfirmationForm();
    }
}

class RequestMntPasswordConfirmationForm {
    expectConfirmationFormShown(exist: boolean) {
        cy.get('#fmp-step2').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectConfirmationFormDescriptionText(text: string) {
        cy.get('#fmp-step2').should('contain.text', text);
        return this;
    }

    expectLinkToGeneratedPdfShown(exist: boolean) {
        cy.get('#myPdfLink').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectLinkToGeneratedPdfHref(href: string) {
        cy.get('#myPdfLink').should('have.attr', 'href', href);
        return this;
    }
}
