import { OrganisationSelector } from './components/organisation-selector.component';

export class IpAnalyserPage {
    private organisationSelector: OrganisationSelector = new OrganisationSelector();

    visit() {
        cy.visit('ip-analyser');
        return this;
    }

    clickOnManageResourcesButton() {
        cy.get('manage-resources mat-expansion-panel').click({ force: true });
        return this;
    }

    expectManageResorcesOptionToContain(index: number, text: string) {
        cy.get(`manage-resources li:nth(${index})`).should('contain.text', text);
        return this;
    }

    selectOrganization(text: string) {
        this.organisationSelector.selectOrganization(text);
        return this;
    }

    expectManageResourcesOptionToExist(exist: boolean) {
        cy.get('manage-resources mat-expansion-panel').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectApiKeysOptionToExist(exist: boolean) {
        cy.get('apikeys-dropdown mat-expansion-panel').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectCreateAssignmentButtonToExist(exist: boolean) {
        cy.get('#button-create-assignment').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectIpvSection(subtitle: string) {
        cy.get('.subtitle h1').should('contain.text', subtitle);
        return this;
    }

    expectErrorAlert(shown: boolean) {
        cy.get('banner .error-banner').should(shown ? 'exist' : 'not.exist');
        return this;
    }

    expectRefreshPanel(shown: boolean) {
        cy.get('refresh').should(shown ? 'exist' : 'not.exist');
        return this;
    }
}
