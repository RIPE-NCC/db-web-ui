export class OrganisationSelector {
    clickOnOrganizationSelector() {
        cy.get('#organisation-selector input').click({ force: true });
        return this;
    }

    selectOrganization(text: string) {
        this.clickOnOrganizationSelector();
        cy.get(`#organisation-selector .ng-dropdown-panel .ng-option:contains("${text}")`).click({ force: true });
        return this;
    }
}
