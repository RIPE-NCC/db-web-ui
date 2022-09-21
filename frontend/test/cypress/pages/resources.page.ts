import { ModalAuthentication } from './components/modals.component';
import { OrganisationSelector } from './components/organisation-selector.component';
import { WhoisObjectEditor } from './components/whois-object-editor.component';
import { WhoisObjectViewer } from './components/whois-object-viewer.component';

type IPTab = 'IPv4' | 'IPv6' | 'ASN';
type ResourceTab = 'My Resources' | 'Sponsored Resources';

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
        cy.get('app-banner').shadow().find('.app-banner.level-positive').should('contain.text', text);
        return this;
    }

    expectInfoMessage(text: string) {
        cy.get('app-banner').shadow().find('.app-banner.level-info').should('contain.text', text);
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

    clickOnMyResources() {
        cy.get('.my-resources .resources-sponsored-tabs li:contains("My Resources")').click();
        return this;
    }

    clickOnSponsoredResources() {
        cy.get('.my-resources .resources-sponsored-tabs li:contains("Sponsored Resources")').click();
        return this;
    }

    clickOnTransferButton() {
        cy.get('transfer-drop-down .grey-button').click({ force: true });
        return this;
    }

    clickOnCreateAssignmentButton() {
        cy.get('.my-resources a.blue-button').click({ force: true });
        return this;
    }

    clickOnIPTab(tab: IPTab) {
        cy.get(`#ipv4-ipv6-asn-tabs .nav-item:contains("${tab}")`).click();
        return this;
    }

    expectTransferOptionToContain(index: number, text: string) {
        cy.get(`transfer-drop-down li:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectTransferOptionToExist(exist: boolean) {
        cy.get('transfer-drop-down .grey-button').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectCreateAssignmentButtonToExist(exist: boolean) {
        cy.get('.my-resources a.blue-button').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectActiveIPTabToBe(tab: IPTab) {
        cy.get('#ipv4-ipv6-asn-tabs .nav-item .active').should('contain.text', tab);
        return this;
    }

    expectResourcesTabSize(size: number) {
        cy.get('.my-resources .resources-sponsored-tabs li').should('have.length', size);
        return this;
    }

    expectResourcesSize(size: number) {
        cy.get('#ipv4-ipv6-asn-panes .tab-pane.active resource-item').should('have.length', size);
        return this;
    }

    expectResourcesToContainText(index: number, text: string) {
        cy.get(`#ipv4-ipv6-asn-panes .tab-pane.active resource-item:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectResourcesToContainFlag(index: number, flag: string) {
        cy.get(`#ipv4-ipv6-asn-panes .tab-pane.active resource-item:nth(${index}) flag`).should('contain.text', flag);
        return this;
    }

    expectResourcesToContainHref(index: number, href: string) {
        cy.get(`#ipv4-ipv6-asn-panes .tab-pane.active resource-item:nth(${index}) a`)
            .should('have.attr', 'href')
            .then((val) => expect(val).to.contain(href));
        return this;
    }

    expectExistProgressBarOnResource(index: number, exist: boolean) {
        cy.get(`#ipv4-ipv6-asn-panes .tab-pane.active resource-item:nth(${index}) .progress-bar`).should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectResourcesTabActiveToBe(tab: ResourceTab) {
        cy.get('.my-resources .resources-sponsored-tabs .nav-tabs .nav-item .active').should('contain.text', tab);
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

    expectUsageToContain(text: string) {
        cy.get('.resources-ip-usage p').should('contain.text', text);
        return this;
    }

    expectUsageToExist(exist: boolean) {
        cy.get('.resources-ip-usage p').should(exist ? 'exist' : 'not.exist');
        return this;
    }
}
