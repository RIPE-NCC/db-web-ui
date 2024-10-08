import { ModalAddAttribute, ModalDeleteObject } from './modals.component';

export class WhoisObjectEditor {
    constructor() {
        cy.get('whois-object-editor').should('exist');
    }

    typeOnField(fieldName: string, text: string) {
        cy.get(`[data-test-id^='${fieldName}'] input`).clear({ force: true }).type(text, { force: true });
        return this;
    }
    clickAddAttributeOnField(fieldName: string) {
        cy.get(`[data-test-id^='${fieldName}'] ~ ul .fa-plus`).click({ force: true });
        return new ModalAddAttribute();
    }

    clickDeleteAttributeOnField(fieldName: string) {
        cy.get(`[data-test-id^='${fieldName}'] ~ ul .fa-trash`).click({ force: true });
        return this;
    }

    clickOnSubmit() {
        cy.get('button:contains("SUBMIT")').click({ force: true });
    }

    expectDisabledSubmit(disabled: boolean) {
        cy.get('button:contains("SUBMIT")').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectFieldExist(fieldName: string, exist: boolean) {
        cy.get(`[data-test-id^='${fieldName}'] input`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectDisabledField(fieldName: string, disabled: boolean) {
        cy.get(`[data-test-id^='${fieldName}'] input`).should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectValueInField(fieldName: string, text: string) {
        cy.get(`[data-test-id^='${fieldName}'] input`).should('contain.value', text);
        return this;
    }

    expectDeleteObjectButtonExist(exist: boolean) {
        cy.get('button:contains("DELETE THIS OBJECT")').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickDeleteObjectButton() {
        cy.get('button:contains("DELETE THIS OBJECT")').click();
        return new ModalDeleteObject();
    }

    expectErrorOnField(fieldName: string, text: string) {
        cy.get(`[data-test-id^='${fieldName}'] .text-error`).should('contain.text', text);
        return this;
    }
}
