import {
    ModalAddAttribute,
    ModalAuthentication,
    ModalCreateDomain,
    ModalDeleteObject,
    ModalEditAttribute,
    ModalPgpKey,
    ModalProcessing,
    ModalSSOPrefilledAuthentication,
} from './components/modals.component';
import { OrganisationSelector } from './components/organisation-selector.component';
import { TextupdatesPage } from './textupdates.page';

export class WebupdatesPage {
    private organisationSelector: OrganisationSelector = new OrganisationSelector();

    visit(url: string) {
        cy.visit(`webupdates/${url}`);
        return this;
    }

    visitDisplay(url: string) {
        cy.visit(`webupdates/display/${url}`);
        return new WebupdatesDisplayPage();
    }

    authenticateWithDisabledAssociate(password: string, expectFail: boolean = false) {
        new ModalAuthentication().typePassword(password).disableAssociateCheckbox().submitModal(expectFail);
        if (expectFail) {
            return this;
        }
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

    getModalSSOPrefilledAuthentication() {
        return new ModalSSOPrefilledAuthentication();
    }

    typeOnField(fieldName: string, text: string) {
        cy.get(`#createForm [name^='${fieldName}']`).clear({ force: true }).type(text, { force: true });
        return this;
    }

    blurOnField(fieldName: string) {
        cy.get(`#createForm [name^='${fieldName}']`).blur();
        return this;
    }

    clickOnField(fieldName: string) {
        cy.get(`#createForm [name^='${fieldName}']`).click();
        return this;
    }

    typeOnNgSelect(fieldName: string, text: string) {
        cy.get(`#createForm [name^='${fieldName}'] input`).clear({ force: true }).type(text, { force: true });
        return this;
    }

    selectFromNgSelect(fieldName: string, option: string) {
        this.clickOnField(fieldName);
        cy.get(`#createForm [name^='${fieldName}'] .ng-option:contains('${option}')`).click();
        return this;
    }

    expectOptionFromNgSelect(fieldName: string, option: string) {
        this.clickOnField(fieldName);
        cy.get(`#createForm [name^='${fieldName}'] .ng-option:contains('${option}')`).should('exist');
        return this;
    }

    expectOptionSizeFromNgSelect(fieldName: string, size: number) {
        this.clickOnField(fieldName);
        cy.get(`#createForm [name^='${fieldName}'] .ng-option`).should('have.length', size);
        return this;
    }

    selectFromFieldAutocomplete(fieldName: string, option: string) {
        cy.get(`#createForm [data-test-id^='${fieldName}'] button:contains('${option}')`).click();
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

    clickOnCertifButton() {
        cy.get('#addCertificate').click();
        return new ModalPgpKey();
    }

    clickOnCreatePair() {
        cy.get('a:contains("Create maintainer and person pair")').click();
        return this;
    }

    clickOnSwitchToPersonRole() {
        cy.get('#create-person-link a').click();
        return this;
    }

    clickOnCreateInTextArea() {
        cy.get('button:contains("CREATE IN TEXT AREA")').click({ force: true });
        cy.get('textarea').should('exist');
        return this;
    }

    clickOnCreateInSingleLines() {
        cy.get('button:contains("CREATE IN SINGLE LINES")').click({ force: true });
        cy.get('textarea').should('not.exist');
        return this;
    }

    selectDomainAndCreate() {
        this.selectObjectType('domain').clickOnCreateButton();
        return new ModalCreateDomain();
    }

    expectDisabledSubmitDomain(disabled: boolean) {
        cy.get('[data-test-id="submit"]').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    submitModification() {
        cy.get('#btnSubmitModify').click();
        return new WebupdatesDisplayPage();
    }

    modifyObject() {
        cy.get('button:contains("MODIFY")').click();
        return new ModalAuthentication();
    }

    submitForm() {
        cy.get('button[type="submit"]').click();
        return this;
    }

    submitCreate() {
        cy.get("button:contains('SUBMIT')").click({ force: true });
        // processing modal should open and close automatically
        const modalProcessing = new ModalProcessing();
        modalProcessing.waitForFinishProcessing();
        return new WebupdatesDisplayPage();
    }

    expectDisabledSubmitCreate(disabled: boolean) {
        cy.get('#btnSubmitCreate').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    clickOnDeleteObjectButton() {
        cy.get('#deleteObject').click();
        return new ModalDeleteObject();
    }

    expectDisabledDelete(disabled: boolean) {
        cy.get('#deleteObject').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    clickEditInTextArea() {
        cy.get('#btnEditInTextArea').click({ force: true });
        return this;
    }

    expectTextupdatePage(url: string) {
        cy.expectCurrentUrlToContain(`textupdates/modify/RIPE/${url}`);
        return new TextupdatesPage();
    }

    expectModifyButtonToExist(exist: boolean) {
        cy.get('#btnSubmitModify').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectDisabledSubmitModify(disabled: boolean) {
        cy.get('#btnSubmitModify').should(disabled ? 'be.disabled' : 'not.be.disabled');
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

    expectFieldToVisible(attrName: string, visible: boolean) {
        cy.get(`#createForm [name^='${attrName}']`).should(visible ? 'be.visible' : 'not.be.visible');
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

    clickEditOnField(fieldName: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-pencil`).eq(0).click({ force: true });
        return new ModalEditAttribute();
    }

    clickHelpOnField(fieldName: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ ul .fa-question`).eq(0).click({ force: true });
        return this;
    }

    selectOrganization(text: string) {
        this.organisationSelector.selectOrganization(text);
        return this;
    }

    expectHelpToContain(fieldName: string, text: string) {
        cy.get(`#createForm label:contains('${fieldName}') ~ description-syntax`).should('contain.text', text);
        return this;
    }

    expectHelpToExist(fieldName: string, exist: boolean) {
        const collapseCss = exist ? '.collapse.show' : '.collapse:not(.show)';
        cy.get(`#createForm label:contains('${fieldName}') ~ description-syntax ${collapseCss}`).should('exist');
        return this;
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

    expectErrorMessageToContain(text: string) {
        cy.get('banner .error-banner').should('contain', text);
    }

    expectWarningMessageToContain(text: string) {
        cy.get('banner .warning-banner').should('contain', text);
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
        cy.get(`#createForm [data-test-id^='${fieldName}'] .text-error`).should('contain.text', text);
        return this;
    }

    expectLinkOnField(fieldName: string, link: string) {
        cy.get(`#createForm [data-test-id^='${fieldName}'] a`).invoke('attr', 'href').should('contain', link);
        return this;
    }

    expectInfoOnField(fieldName: string, text: string) {
        cy.get(`#createForm [data-test-id^='${fieldName}'] .text-info`).should('contain.text', text);
        return this;
    }

    expectReverseZoneTableToHaveRows(rows: number) {
        cy.get('#createForm table tbody tr').should('have.length', rows);
        return this;
    }

    expectAbuseCExist(exist: boolean) {
        cy.get('#createRoleForAbuseCAttribute').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectFormExist(exist: boolean) {
        cy.get('#createForm').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectErrorMessage(text: string) {
        cy.get('banner .error-banner').should('contain.text', text);
        return this;
    }

    expectUserLoggedImage(exist: boolean) {
        cy.get('user-login')
            .should('exist')
            .shadow()
            .find('image[id="user-img"]')
            .should(exist ? 'exist' : 'not.exist');
        return this;
    }
}

class WebupdatesDisplayPage {
    clickOnCreateSharedMaintainer() {
        cy.get('button:contains("CREATE SHARED MAINTAINER")').click({ force: true });
        return new WebupdatesPage();
    }

    expectSuccessMessage(text: string) {
        cy.get('banner .success-banner').should('contain.text', text);
        return this;
    }

    expectErrorMessage(text: string) {
        cy.get('banner .error-banner').should('contain.text', text);
        return this;
    }

    expectChangesPanelToExist(exist: boolean) {
        cy.get('section.inner-container').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectedFilteredFields(filtered: boolean) {
        cy.get('section.inner-container').should(filtered ? 'contain.text' : 'not.contain.text', 'Filtered');
        return this;
    }

    expectedNoImgTag() {
        cy.get('section.inner-container img').should('not.exist');
        return this;
    }

    expectedNoScriptTag() {
        cy.get('section.inner-container script').should('not.exist');
        return this;
    }

    expectUmlaut(text: string) {
        cy.get('section.inner-container').should('contain.text', text);
        return this;
    }

    expectedNumberOfAddedLines(addedLines: number) {
        cy.get('section.inner-container .textdiff .ins').should('have.length', addedLines);
        return this;
    }

    expectedNumberOfDeletedLines(deletedLines: number) {
        cy.get('section.inner-container .textdiff .del').should('have.length', deletedLines);
        return this;
    }
}

export class WebupdatesDelete {
    expectSuccessMessage(text: string) {
        cy.get('banner .success-banner').should('contain.text', text);
        return this;
    }
}
