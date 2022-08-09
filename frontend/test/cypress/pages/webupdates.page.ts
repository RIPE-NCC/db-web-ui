export class WebupdatesPage {
    visit(url: string) {
        cy.visit(`webupdates/${url}`);
        return this;
    }

    authenticateWithDisabledAssociate(password: string) {
        new ModalAuthentication().typePassword(password).disableAssociateCheckbox().submitModal();
        this.expectModalToExist(false);
        return this;
    }

    authenticateWithEnabledAssociate(password: string) {
        new ModalAuthentication().typePassword(password).submitModal();
        this.expectModalToExist(false);
        return this;
    }

    getModalAuthentication() {
        return new ModalAuthentication();
    }

    typeOnField(fieldName: string, text: string) {
        cy.get(`#createForm [name^='${fieldName}']`).clear({ force: true }).type(text, { force: true });
        return this;
    }

    blurOnField(fieldName: string) {
        cy.get(`#createForm [name^='${fieldName}']`).blur();
        return this;
    }

    selectFromFieldAutocomplete(fieldName: string, option: string) {
        cy.get(`#createForm div[data-test-id^='${fieldName}'] button:contains('${option}')`).click();
        this.blurOnField(fieldName);
        return this;
    }

    selectObjectType(type: string) {
        cy.get('#objectTypeSelector').select(type);
        return this;
    }

    clickOnCreateButton() {
        cy.get('#btnNavigateToCreate').click();
        return this;
    }

    selectDomainAndCreate() {
        this.selectObjectType('domain').clickOnCreateButton();
        return new ModalCreateDomain();
    }

    submitModification() {
        cy.get('#btnSubmitModify').click();
        return new WebupdatesDisplay();
    }

    submitCreate() {
        cy.get("button:contains('Submit')").click({ force: true });
        // processing modal should open and close automatically
        const modalProcessing = new ModalProcessing();
        modalProcessing.expectModalToExist(true).expectModalToExist(false);
        return new WebupdatesDisplay();
    }

    clickOnDeleteObjectButton() {
        cy.get('#deleteObject').click();
        return new ModalDeleteObject();
    }

    expectDeleteButtonToExist(exist: boolean) {
        cy.get('#deleteObject').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectModifyButtonToExist(exist: boolean) {
        cy.get('#btnSubmitModify').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    getModalAddAttribute() {
        return new ModalAddAttribute();
    }

    expectModalToExist(exist: boolean) {
        cy.get('.modal-content').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectFieldToExist(attrName: string, exist: boolean) {
        cy.get(`#createForm [name^='${attrName}']`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickAddAttributeOnField(fieldName: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-plus`).click({ force: true });
        return new ModalAddAttribute();
    }

    expectEditOnField(fieldName: string, exist: boolean) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-pencil`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectRemoveOnField(fieldName: string, exist: boolean) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-trash`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickRemoveOnField(fieldName: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-trash`).click({ force: true });
        return this;
    }

    clickEditOnField(fieldName: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-pencil`).eq(0).click({ force: true });
        return new ModalEditAttribute();
    }

    expectNumberOfFields(fieldName: string, count: number) {
        cy.get(`#createForm [name^='${fieldName}']`).should('have.length', count);
        return this;
    }

    expectDisabledField(fieldName: string, disabled: boolean) {
        // depends on ng-select is used, the input tag might be in different DOM location
        cy.get(`#createForm input[name^='${fieldName}'], #createForm [name^='${fieldName}'] input`).should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectError(text: string) {
        cy.get('#anchor-certif ~ .text-error').should('contain.text', text);
        return this;
    }

    expectValueInField(fieldName: string, text: string, index: number = 0) {
        cy.get(`#createForm [name^='${fieldName}']`).eq(index).should('contain.value', text);
        return this;
    }

    expectTextInField(fieldName: string, text: string, index: number = 0) {
        cy.get(`#createForm [name^='${fieldName}']`).eq(index).should('contain.text', text);
        return this;
    }

    expectMaintainerToContain(maintainer: string) {
        cy.get('#selectMaintainerDropdown').should('contain.text', maintainer);
        return this;
    }
    expectDisabledMaintainer(disabled: boolean) {
        cy.get('#selectMaintainerDropdown').should(disabled ? 'have.class' : 'not.have.class', 'ng-select-disabled');
        return this;
    }

    expectHeadingTitleToContain(text: string) {
        cy.get('#createForm h1').should('contain.text', text);
        return this;
    }

    expectErrorOnField(fieldName: string, text: string) {
        cy.get(`#createForm div[data-test-id^='${fieldName}'] .text-error`).should('contain.text', text);
        return this;
    }

    expectLinkOnField(fieldName: string, link: string) {
        cy.get(`#createForm div[data-test-id^='${fieldName}'] a`).invoke('attr', 'href').should('contain', link);
        return this;
    }

    expectInfoOnField(fieldName: string, text: string) {
        cy.get(`#createForm div[data-test-id^='${fieldName}'] .text-info`).should('contain.text', text);
        return this;
    }

    expectReverseZoneTableToHaveRows(rows: number) {
        cy.get('#createForm table tbody tr').should('have.length', rows);
        return this;
    }
}

class ModalAuthentication {
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

    submitModal() {
        cy.get('.modal-content button[type=submit]').click();
        return this;
    }

    expectFooterToContain(text: string) {
        cy.get('.modal-content .modal-footer').should('contain.text', text);
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
}

class ModalDeleteObject {
    expectToShowModal() {
        cy.get('.modal-content').should('exist');
        return this;
    }

    clickOnConfirmDeleteObject() {
        cy.get('.modal-content #btnConfirmDeleteObject').click();
        return new WebupdatesDelete();
    }
}

class ModalAddAttribute {
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

class ModalEditAttribute {
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

export class WebupdatesDisplay {
    expectSuccessMessage(text: string) {
        cy.get('app-banner').shadow().find('.app-banner.level-positive').should('contain.text', text);
        return this;
    }

    expectErrorMessage(text: string) {
        cy.get('app-banner').shadow().find('.app-banner.level-alarm').should('contain.text', text);
        return this;
    }

    expectChangesPanelToExist(exist: boolean) {
        cy.get('section.inner-container').should(exist ? 'exist' : 'not.exist');
        return this;
    }
}

export class WebupdatesDelete {
    expectSuccessMessage(text: string) {
        cy.get('app-banner').shadow().find('.app-banner.level-positive').should('contain.text', text);
        return this;
    }
}

class ModalCreateDomain {
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

class ModalProcessing {
    expectModalToExist(exist: boolean) {
        cy.get('.modal-content').should(exist ? 'exist' : 'not.exist');
        if (exist) {
            cy.get('.modal-content').should('contain.text', 'Processing your domain objects');
        }
        return this;
    }
}
