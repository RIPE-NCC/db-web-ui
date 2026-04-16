import { OrganisationSelector } from './components/organisation-selector.component';

type KeyType = 'Maintainer' | 'My Resources' | 'IP Analyser';
type KeyTypeFormat = 'XML' | 'JSON' | 'PLAIN TEXT';

export class ApiKeysPage {
    private organisationSelector: OrganisationSelector = new OrganisationSelector();

    visit() {
        cy.visit('api-keys');
        return this;
    }

    createApiKey(keyType: KeyType, label: string, expiresAt: string, details?: string[]) {
        this.toggleAccordion('Create a new Database key');
        this.selectOption('Key type', keyType);
        this.getInput('Key name').clear().type(label);
        this.getInput('Expiration date').clear().type(expiresAt);
        if (details) {
            this.getInput('Maintainer').clear().type(details[0]);
        }
        cy.get('button:contains("Create a key")').click();
        return this;
    }

    openApiKeyTypeSelect() {
        this.getSelect('Key type').click();
        return this;
    }

    expectCreatedKeyDialogToBePresent() {
        cy.get('mat-dialog-container').should('exist');
        cy.get('mat-dialog-container').should('contain.text', 'Your Database Key');
        return this;
    }

    addedMultipleMaintainerField() {
        this.clickAddMaintainerButton();
        cy.get(`label:contains("Maintainer")`).should('have.length', 2);
        return this;
    }

    removedMultipleMaintainerField() {
        this.clickRemoveMaintainerButton();
        cy.get(`label:contains("Maintainer")`).should('have.length', 1);
        return this;
    }

    clickAddMaintainerButton() {
        return cy.get(`.fa-circle-plus`).click();
    }

    clickRemoveMaintainerButton() {
        return cy.get(`.fa-circle-minus`).first().click();
    }

    toggleAccordion(accordionTitle: string) {
        cy.get(`mat-accordion:contains(${accordionTitle})`).click();
        return this;
    }

    selectOrganizationInDropdown(text: string) {
        this.organisationSelector.selectOrganization(text);
        return this;
    }

    expectedOrganisationInField(orgName: string) {
        this.getInput('Selected organisation').should('have.value', orgName);
        return this;
    }

    expectedDisabledKeyType(keyType: KeyType) {
        cy.get(`mat-option:contains("${keyType}")`).should('have.attr', 'aria-disabled', 'true');
        return this;
    }

    changeKeyType(selectKeyType: KeyType) {
        this.selectOption('Key type', selectKeyType);
        return this;
    }

    changeExamplesKeyType(keyType: KeyType) {
        this.getExamplesKeyTypeDropdown().click();
        cy.get(`mat-option:contains("${keyType}")`).click();
        return this;
    }

    changeExamplesKeyTypeFormat(keyTypeFormat: KeyTypeFormat) {
        cy.wait(1000);
        this.getExamplesKeyTypeFormatDropdown().click();
        cy.get(`mat-option:contains("${keyTypeFormat}")`).click();
        return this;
    }

    expectExamplesKeyTypeToBe(keyType: KeyType) {
        this.getExamplesKeyTypeDropdown().should('contain.text', keyType);
        return this;
    }

    expectedDisabledExamplesKeyType(keyType: KeyType) {
        this.getExamplesKeyTypeDropdown().click();
        cy.get(`mat-option:contains("${keyType}")`).should('have.attr', 'aria-disabled', 'true');
        return this;
    }

    expectExamplesKeyTypeFormatToBe(format: KeyTypeFormat) {
        this.getExamplesKeyTypeFormatDropdown().should('contain.text', format);
        return this;
    }

    expectExamplesKeyTypeFormatOptionsToContain(formats: KeyTypeFormat[]) {
        this.getExamplesKeyTypeFormatDropdown().click();
        cy.get('mat-option').should('have.length', formats.length);
        formats.forEach((format, idx) => {
            cy.get('mat-option').eq(idx).should('contain.text', format);
        });
        // click away to close option selector
        cy.get('body').click();
        return this;
    }

    expectExamplesToContain(text: string) {
        cy.get('examples-api-keys').should('contain.text', text);
        return this;
    }

    private getExamplesKeyTypeDropdown() {
        return cy.get('mat-select[placeholder="Key type"]');
    }

    private getExamplesKeyTypeFormatDropdown() {
        return cy.get('mat-select[placeholder="Format"]');
    }

    private getInput(label: string) {
        return cy.get(`.mat-mdc-form-field-flex:contains("${label}") input`);
    }

    private getSelect(label: string) {
        return cy.get(`.mat-mdc-form-field-flex:contains("${label}") mat-select`);
    }

    private selectOption(dropdownLabel: string, value: string) {
        this.getSelect(dropdownLabel).click();
        cy.get(`mat-option:contains("${value}")`).click();
    }
}
