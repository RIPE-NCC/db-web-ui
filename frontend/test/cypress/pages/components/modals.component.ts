import { WebupdatesDelete } from '../webupdates.page';

export class ModalAuthentication {
    expectSelectedAuthenticationMaintainer(maintainer: string) {
        cy.get('#selectAuthMntner').should('contain.text', maintainer);
        return this;
    }

    expectItemInList(itemValue: string, exist: boolean) {
        cy.get(`#selectAuthMntner select option[label='${itemValue}']`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    typePassword(password: string) {
        cy.get(".modal-content input[name='passwordAuth']").type(password);
        return this;
    }

    disableAssociateCheckbox() {
        cy.get(".modal-content input[name='associate']").uncheck();
        return this;
    }

    submitModal(expectFail: boolean = false) {
        cy.get('.modal-content button[type=submit]').click();
        if (!expectFail) {
            cy.get('.modal-content .modal-body').should('not.exist');
        }
        return this;
    }

    expectFooterToContain(text: string, contain: boolean = true) {
        cy.get('.modal-content .modal-footer').should(contain ? 'contain.text' : 'not.contain.text', text);
        return this;
    }

    clickOnForceDelete() {
        cy.get('.modal-content .modal-footer a:contains("Force delete")').click();
        return this;
    }

    expectBodyToContain(text: string) {
        cy.get('.modal-content .modal-body').should('contain.text', text);
        return this;
    }

    expectBannerToContain(text: string) {
        cy.get('.modal-content .modal-banner').should('contain.text', text);
        return this;
    }

    closeModal() {
        cy.get('.modal-header .close').click();
        cy.get('.modal-content .modal-body').should('not.exist');
    }
}

export class ModalDeleteObject {
    expectToShowModal() {
        cy.get('.modal-content').should('exist');
        return this;
    }

    clickOnConfirmDeleteObject() {
        cy.get('.modal-content #btnConfirmDeleteObject').click();
        return new WebupdatesDelete();
    }

    typeReason(reason: string) {
        cy.get('.modal-content input').clear().type(reason);
        return this;
    }
}

export class ModalAddAttribute {
    expectModalToExist(exist: boolean) {
        cy.get('.modal-content').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    selectFromList(itemValue: string) {
        cy.get('.modal-content select').select(itemValue);
        return this;
    }

    expectItemInList(itemValue: string, exist: boolean) {
        cy.get(`.modal-content select option[label='${itemValue}']`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    submitModal() {
        cy.get('.modal-content button[type=submit]').click();
        return this;
    }
}

export class ModalEditAttribute {
    expectHeaderToContain(text: string) {
        cy.get('.modal-content .modal-header').should('contain.text', text);
        return this;
    }

    expectPanelToContain(text: string) {
        cy.get('.modal-content .modal-panel').should('contain.text', text);
        return this;
    }

    close() {
        cy.get('.modal-content .modal-header .close').click();
        cy.get('.modal-content').should('not.exist');
    }
}

export class ModalCreateDomain {
    expectModalToExist(exist: boolean) {
        cy.get('.modal-content').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectBodyToContain(text: string) {
        cy.get('.modal-content').should('contain.text', text);
        return this;
    }

    acceptModal() {
        cy.get('#modal-splash-button').click();
    }
}

export class ModalProcessing {
    waitForFinishProcessing() {
        cy.get('.modal-content').should('exist');
        cy.get('.modal-content').should('contain.text', 'Processing your domain objects');
        cy.get('.modal-content').should('not.exist');
        return this;
    }
}
