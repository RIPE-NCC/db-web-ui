import { ModalAuthentication } from './components/modals.component';
import { OrganisationSelector } from './components/organisation-selector.component';
import { WhoisObjectEditor } from './components/whois-object-editor.component';
import { WhoisTextEditor } from './components/whois-object-text-editor.component';
import { WhoisObjectViewer } from './components/whois-object-viewer.component';

type IPTab = 'IPv4' | 'IPv6' | 'ASN';
type ResourceToggleBtn = 'My Resources' | 'Sponsored Resources';

export class ResourcesPage {
    visitOverview() {
        cy.visit(`myresources/overview`);
        return new ResourcesOverViewPage();
    }

    visitDetails(url: string) {
        cy.visit(`myresources/detail/${url}`);
        return new ResourcesDetailPage();
    }
}

type TableId = 'more-specifics' | 'associated-route-objects' | 'associated-domain-objects';

export class ResourcesDetailPage {
    getWhoisObjectViewer() {
        return new WhoisObjectViewer();
    }

    getWhoisObjectEditor() {
        return new WhoisObjectEditor();
    }

    getWhoisTextEditor() {
        return new WhoisTextEditor();
    }

    switchToTextAreaEditor() {
        cy.get(`button:contains("EDIT IN TEXT AREA")`).click();
        return this;
    }

    switchToObjectEditor() {
        cy.get(`button:contains("EDIT IN SINGLE LINES")`).click();
        return this;
    }

    clickLinkOnTable(table: TableId, text: string) {
        cy.get(`[id="${table}"] tbody tr td a:contains("${text}")`).click();
        return this;
    }

    clickOnUpdate() {
        cy.get('a:contains("Update object")').click({ force: true });
        return new ModalAuthentication();
    }

    filterTable(table: TableId, text: string) {
        cy.get(`[id="${table}"] .prefix-filter input`).clear().type(text).blur();
        return this;
    }

    expectRowOnTableToContainText(table: TableId, row: number, col: number, text: string) {
        cy.get(`[id="${table}"] tbody tr:nth(${row}) td:nth(${col})`).should('contain.text', text);
        return this;
    }

    expectRowOnTableToContainHref(table: TableId, row: number, col: number, href: string) {
        cy.get(`[id="${table}"] tbody tr:nth(${row}) td:nth(${col}) a`).invoke('attr', 'href').should('contain', href);
        return this;
    }

    expectRowsOnTable(table: TableId, rows: number) {
        cy.get(`[id="${table}"] tbody tr`).should('have.length', rows);
        return this;
    }

    expectTableExist(table: TableId, exist: boolean) {
        cy.get(`[id="${table}"] tbody tr`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectBackToMyResourcesButtonToExist(exist: boolean) {
        cy.get('button:contains("Back to my resources")').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectSiteMapButtonToExist(exist: boolean) {
        cy.get('button .fa-sitemap').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectIpUsageToExist(exist: boolean) {
        cy.get('ip-usage').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectIpUsagePercentageSize(size: number) {
        cy.get('ip-usage .box-statistic').should('have.length', size);
        return this;
    }

    expectIpUsagePercentageToContainText(box: string, text: string) {
        cy.get(`ip-usage .box-title:contains(${box}) ~ .box-statistic`).should('contain.text', text);
        return this;
    }

    expectFlagsSize(size: number) {
        cy.get('.flags-container flag').should('have.length', size);
        return this;
    }

    expectFlagToContainText(index: number, text: string) {
        cy.get(`.flags-container flag:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectTablePaginationToContainText(table: TableId, text: string) {
        cy.get(`[id="${table}"] .prefix-filter`).should('contain.text', text);
        return this;
    }

    expectSuccessMessage(text: string) {
        cy.get('banner .success-banner').should('contain.text', text);
        return this;
    }

    expectInfoMessage(text: string) {
        cy.get('banner .informational-banner').should('contain.text', text);
        return this;
    }

    expectModalToExist(exist: boolean) {
        cy.get('.modal-content').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectFieldToExist(attrName: string, exist: boolean) {
        cy.get(`#editortop [name^='${attrName}']`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectDisabledField(fieldName: string, disabled: boolean) {
        // depends on ng-select is used, the input tag might be in different DOM location
        cy.get(`#editortop input[name^='${fieldName}'], #editortop [name^='${fieldName}'] input`).should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectOptionSizeFromNgSelect(fieldName: string, size: number) {
        this.clickOnField(fieldName);
        cy.get(`#editortop [name^='${fieldName}'] .ng-option`).should('have.length', size);
        return this;
    }

    clickOnField(fieldName: string) {
        cy.get(`#editortop [name^='${fieldName}']`).click();
        return this;
    }

    clickOnLinkInField(valueInLink: string) {
        cy.get(`#editortop a:contains('${valueInLink}')`).click({ force: true });
        return this;
    }

    expectOptionFromNgSelect(fieldName: string, option: string) {
        this.clickOnField(fieldName);
        cy.get(`#editortop [name^='${fieldName}'] .ng-option:contains('${option}')`).should('exist');
        return this;
    }
}

export class ResourcesOverViewPage {
    private organisationSelector: OrganisationSelector = new OrganisationSelector();

    clickOnOrganizationSelector() {
        this.organisationSelector.clickOnOrganizationSelector();
        return this;
    }

    selectOrganization(text: string) {
        this.organisationSelector.selectOrganization(text);
        return this;
    }

    clickOnSponsoredResources() {
        cy.get(`.mat-button-toggle .mat-button-toggle-label-content:contains("Sponsored Resources")`).click();
        return this;
    }

    clickOnManageResourcesButton() {
        cy.get('manage-resources mat-expansion-panel').click({ force: true });
        return this;
    }

    clickOnCreateAssignmentButton() {
        cy.get('#button-create-assignment').click({ force: true });
        return this;
    }

    clickOnIPTab(tab: IPTab) {
        cy.contains('.ipv4-ipv6-asn-tabs .mdc-tab__text-label', tab).closest('.mdc-tab').click();
        return this;
    }

    expectManageResorcesOptionToContain(index: number, text: string) {
        cy.get(`manage-resources li:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectManageResourcesOptionToExist(exist: boolean) {
        cy.get('manage-resources mat-expansion-panel').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectCreateAssignmentButtonToExist(exist: boolean) {
        cy.get('#button-create-assignment').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectActiveIPTabToBe(tab: IPTab) {
        cy.get('.ipv4-ipv6-asn-tabs .mdc-tab--active').should('contain.text', tab);
        return this;
    }

    expectResourcesTabSize(size: number) {
        cy.get('mat-button-toggle-group mat-button-toggle').should('have.length', size);
        return this;
    }

    expectDescription(description: string) {
        cy.get('.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active').should('contain.text', description);
        return this;
    }

    expectResourcesSize(size: number) {
        cy.get('.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node').should('have.length', size);
        return this;
    }

    expectResourcesToContainText(index: number, text: string) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active .node-content:nth(${index})`).should('contain.text', text);
        return this;
    }

    clickOnPluseIcon(index: number) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .fa-plus`).click();
        return this;
    }

    clickOnMinusIcon(index: number) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .fa-minus`).click();
        return this;
    }

    expectExistPlusIcon(index: number, exist: boolean) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .fa-plus`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectExistMinusIcon(index: number, exist: boolean) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .fa-minus`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectIssueNoteInNode(index: number, contain: boolean) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index})`).should(contain ? 'contain.text' : 'not.contain.text', '1 to review');
        return this;
    }

    expectOrangeDot(index: number, exist: boolean) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .issue`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectBlueDot(index: number, exist: boolean) {
        cy.get(`.ipv4-ipv6-asn-tabs .mat-mdc-tab-body-active mat-tree-node:nth(${index}) .ok`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectResourcesToggleBtnActiveToBe(tab: ResourceToggleBtn) {
        cy.get('mat-button-toggle-group .mat-button-toggle-checked .mat-button-toggle-label-content').should('have.text', tab);
        return this;
    }

    expectNumberOfOrganizations(size: number) {
        cy.get('#organisation-selector .ng-dropdown-panel .ng-option').should('have.length', size);
        return this;
    }

    expectOrganizationToContain(index: number, text: string) {
        cy.get(`#organisation-selector .ng-dropdown-panel .ng-option:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectUsageToContain(title: string, value: string) {
        cy.get('.resources-ip-usage p').should('contain.text', title);
        cy.get('.resources-ip-usage span').should('contain.text', value);
        return this;
    }

    expectUsageToExist(exist: boolean) {
        cy.get('.resources-ip-usage .usage-card').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectResourceHealthCardInUsageToExist(exist: boolean) {
        cy.get('.resources-ip-usage health-check-card').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectHealtyStatusCheck(text: string) {
        cy.get('.resources-ip-usage health-check-card').should('contain.text', text);
        return this;
    }

    expectNodePreviewPresent(exist: boolean) {
        cy.get('node-preview').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectFullViewButtonSelected() {
        cy.get('.view-mode-panel button:has(em.fa-line-columns)').should('have.class', 'select');
        return this;
    }

    expectTreeExpandViewSelected() {
        cy.get('.view-mode-panel button:has(em.fa-expand)').should('have.class', 'select');
        return this;
    }

    clickOnFullView() {
        cy.get('.fa-line-columns').click();
        return this;
    }

    clickOnTreeExpandView() {
        cy.get('.fa-expand').click();
        return this;
    }
}
