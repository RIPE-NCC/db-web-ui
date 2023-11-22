import { OrganisationSelector } from './components/organisation-selector.component';
import { WhoisObjectViewer } from './components/whois-object-viewer.component';

export class QueryPage {
    private organisationSelector: OrganisationSelector = new OrganisationSelector();

    visit() {
        cy.visit('query');
        return this;
    }

    visitQueryPageXSS(url) {
        cy.visit(`query${url}`);
        return this;
    }

    expectSearchFieldToBeEmpty() {
        cy.get('input[name="qp.queryText"]').should('be.empty');
        return this;
    }

    expectDropdownFiltersToExist(exist: boolean) {
        cy.get('#advanceFilterMenu').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickOnSearchButton() {
        cy.get('form[name="searchform"] button .fa-search').click({ force: true });
        return this;
    }

    clickOnReset() {
        cy.get('#resetFilters').click({ force: true });
        return this;
    }

    expectResetDisabled(disabled: boolean) {
        cy.get('#resetFilters').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    clickOnApplyFilters() {
        cy.get('#applyFilters').click({ force: true });
        return this;
    }

    expectApplyFiltersDisabled(disabled: boolean) {
        cy.get('#applyFilters').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    typeSearchTerm(term: string) {
        cy.get('input[name="qp.queryText"]').clear({ force: true }).type(term, { force: true });
        return this;
    }

    expectSearchTerm(term: string) {
        cy.get('input[name="qp.queryText"]').should('have.value', term, { force: true });
        return this;
    }

    expectSearchToHaveFocus() {
        cy.get('input[name="qp.queryText"]').should('have.focus');
        return this;
    }

    clickOnShareButton() {
        cy.get('button[mattooltip="Share Panel"]').click({ force: true });
        return this;
    }

    clickOnCopyUrlButton() {
        cy.get('.perm-xml-json-resultlinks .controls button').click({ force: true });
        return this;
    }

    selectOrganization(text: string) {
        this.organisationSelector.selectOrganization(text);
        return this;
    }

    expectCertificateBannerToContain(text: string) {
        cy.get('certificate-banner').should('include.text', text);
        return this;
    }

    expectPermaLinkToContain(text: string) {
        cy.get('.perm-xml-json-resultlinks #mat-input-1').should('contain.value', text);
        return this;
    }

    expectXmlLinkToContain(text: string) {
        return this.expectHrefToContain('.perm-xml-json-resultlinks a:contains("XML")', text);
    }

    expectJsonLinkToContain(text: string) {
        return this.expectHrefToContain('.perm-xml-json-resultlinks a:contains("JSON")', text);
    }

    expectPlainTextLinkToContain(text: string) {
        return this.expectHrefToContain('.perm-xml-json-resultlinks a:contains("PLAIN TEXT")', text);
    }

    expectHrefToContain(selector: string, href: string) {
        cy.get(selector).invoke('attr', 'href').should('contain', href);
        return this;
    }

    expectShowShareButton(exist: boolean) {
        cy.get('button#sharePermaLink').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectSearchHeaderLinkToContain(text: string, index = 0) {
        cy.get(`.lookupheader a:nth(${index})`).invoke('attr', 'href').should('contain', text);
        return this;
    }

    expectSearchHeaderToContain(text: string) {
        cy.get('.lookupheader').should('contain.text', text);
        return this;
    }

    clickOnTypesFilterDropdown() {
        cy.get('#typeMenu').click({ force: true });
        return new TypesFilter();
    }

    expectTypesFilterDropdownToExist(exist: boolean) {
        cy.get('#typeMenu').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickOnHierarchyFlagsDropdown() {
        cy.get('#hierarchyFlagsMenu').click({ force: true });
        return new HierarchyFlagsFilter();
    }

    expectHierarchyFlagsDropdownToExist(exist: boolean) {
        cy.get('#hierarchyFlagsMenu').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectHierarchyFlagsMenuDropdownToContain(text: string) {
        cy.get('#hierarchyFlagsMenu').should('contain.text', text);
        return this;
    }

    clickOnInverseLookupFilterDropdown() {
        cy.get('#inverseLookupMenu').click({ force: true });
        return new InverseLookupFilter();
    }

    expectInverseLookupFilterDropdownToExist(exist: boolean) {
        cy.get('#inverseLookupMenu').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    clickOnAdvancedFilterDropdown() {
        cy.get('#advanceFilterMenu').click({ force: true });
        return new AdvancedFilter();
    }

    expectAdvancedFilterDropdownToExist(exist: boolean) {
        cy.get('#advanceFilterMenu').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectWhoisObjectViewerComponentPresentInResults() {
        cy.get('#resultsSection lookup whois-object-viewer').should('exist');
        return this;
    }

    expectNoResults() {
        cy.get('#resultsSection').should('contain.text', 'No results found, try changing the search term or filters');
        return this;
    }

    expectNoErrorMessage() {
        cy.get('.banner-text', { includeShadowDom: true }).should('not.contain', 'ERROR:');
    }

    expectErrorMessageToContain(text: string) {
        cy.get('.banner-text', { includeShadowDom: true }).should('contain', text);
    }

    expectNumberOfResults(count: number) {
        cy.get('#resultsSection lookup').should('have.length', count);
        return this;
    }

    expectResultToContainText(index: number, text: string) {
        cy.get(`#resultsSection lookup:nth(${index})`).should('contain.text', text);
        return this;
    }

    expectTypesMenuTitleToBe(title: string) {
        cy.get('#typeMenu').should('contain.text', title);
        return this;
    }

    expectHierarchyFlagsMenuTitleToBe(title: string) {
        cy.get('#hierarchyFlagsMenu').should('contain.text', title);
        return this;
    }

    expectHierarchyFlagsMenuToBeDisabled(disabled: boolean) {
        cy.get('#hierarchyFlagsMenu').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectInverseLookupMenuTitleToBe(title: string) {
        cy.get('#inverseLookupMenu').should('contain.text', title);
        return this;
    }

    expectAdvancedFilterMenuTitleToBe(title: string) {
        cy.get('#advanceFilterMenu').should('contain.text', title);
        return this;
    }

    expectQueryFlagsContainerVisible(visible: boolean) {
        cy.get('query-flags').should(visible ? 'be.visible' : 'not.be.visible');
        return this;
    }

    expectQueryFlagToContain(index: number, text: string) {
        cy.get(`query-flags flag:nth(${index})`).should('contain.text', text);
        return this;
    }

    getWhoisObjectViewer(index: number) {
        return new WhoisObjectViewer(`.resultpane lookup:nth(${index})`);
    }

    expectVersionTagToContain(text: string, contain: boolean) {
        cy.get('whois-version').should(contain ? 'contain.text' : 'not.contain.text', text);
        return this;
    }

    expectTemplateSearchResultToContain(text: string) {
        cy.get('#templateResultsSection pre').should('contain.text', text);
        return this;
    }

    expectTemplateSearchResultToExist(exist: boolean) {
        cy.get('#templateResultsSection pre').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectNoXSSBanner() {
        cy.get('.app-banner.level-alarm .banner-text', { includeShadowDom: true }).find('img').should('not.exist');
        return this;
    }

    expectNoLinksXSSinBanner() {
        cy.get('.app-banner.level-alarm .banner-text', { includeShadowDom: true }).find('a').should('not.exist');
        return this;
    }

    expectToHaveAutofillOnSearchTermField() {
        cy.get('form input[name="qp.queryText"][autocomplete="on"]').should('exist');
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

class TypesFilter {
    clickCheckbox(name: string) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`).first().click({ force: true });
        return this;
    }

    expectCheckboxToBeDisabled(name: string, disabled: boolean) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`)
            .first()
            .should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectCheckboxToBeChecked(name: string, checked: boolean) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`)
            .first()
            .should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }
}

type Flag = 'No' | 'l' | 'L' | 'm' | 'M' | 'x';

class HierarchyFlagsFilter {
    expectHierarchyFlagsToBeDisplayed() {
        cy.get('hierarchy-flags').should('be.visible');
        return this;
    }

    clickFlag(flag: Flag) {
        const index = (() => {
            switch (flag) {
                case 'No':
                    return 0;
                case 'l':
                    return 120;
                case 'L':
                    return 240;
                case 'm':
                    return 380;
                case 'M':
                    return 500;
                case 'x':
                    return 600;
            }
        })();
        cy.get(`hierarchy-flags mat-slider input`).click(index, 0, { force: true });
        return this;
    }

    expectHierarchyFlagSliderToBe(flag: Flag) {
        const index = (() => {
            switch (flag) {
                case 'No':
                    return 0;
                case 'l':
                    return 1;
                case 'L':
                    return 2;
                case 'm':
                    return 3;
                case 'M':
                    return 4;
                case 'x':
                    return 5;
            }
        })();
        cy.get('hierarchy-flags mat-slider input').should('have.attr', 'aria-valuetext', index);
        return this;
    }

    expectHierarchyFlagDescriptionText(description: string) {
        cy.get('.flag-description').should('have.text', description);
        return this;
    }

    expectHierarchyDCheckBoxInputChecked(selected: boolean) {
        cy.get('#hierarchyD').should(selected ? 'be.checked' : 'not.be.checked');
        return this;
    }

    expectHierarchyDCheckBoxEnabled(enabled: boolean) {
        cy.get('#hierarchyD input').should(enabled ? 'be.enabled' : 'not.be.enabled');
        return this;
    }

    clickHierarchyDCheckBox() {
        cy.get('#hierarchyD').click();
        return this;
    }
}

class InverseLookupFilter {
    clickCheckbox(name: string) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`).click({ force: true });
        return this;
    }

    expectCheckboxToBeDisabled(name: string, disabled: boolean) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`).should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectCheckboxToBeChecked(name: string, checked: boolean) {
        cy.get(`.mat-mdc-checkbox:contains("${name}") input`).should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }
}

class AdvancedFilter {
    expectCheckboxDoNotRetrieveChecked(checked: boolean) {
        cy.get('#doNotRetrieveRelatedObjects.mat-mdc-checkbox input').should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }

    clickCheckboxDoNotRetrieve() {
        cy.get('#doNotRetrieveRelatedObjects.mat-mdc-checkbox input').click({ force: true });
        return this;
    }

    expectCheckboxShowFullObjectDetailsChecked(checked: boolean) {
        cy.get('#showFullObjectDetails.mat-mdc-checkbox input').should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }

    clickCheckboxShowFullDetails() {
        cy.get('#showFullObjectDetails.mat-mdc-checkbox input').click({ force: true });
        return this;
    }
}
