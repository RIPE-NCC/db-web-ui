export class QueryPage {
    visit() {
        cy.visit('query');
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

    expectPermaLinkToContain(text: string) {
        cy.get('.perm-xml-json-resultlinks #mat-input-1').should('contain.value', text);
        return this;
    }

    expectXmlLinkToContain(text: string) {
        cy.get('.perm-xml-json-resultlinks a:contains("XML")').invoke('attr', 'href').should('contain', text);
        return this;
    }

    expectJsonLinkToContain(text: string) {
        cy.get('.perm-xml-json-resultlinks a:contains("JSON")').invoke('attr', 'href').should('contain', text);
        return this;
    }

    expectShareButtonDisabled(disabled: boolean) {
        cy.get('button[mattooltip="Share Panel"]').should(disabled ? 'be.disabled' : 'not.be.disabled');
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
        cy.get('#typeMenu .mat-button-wrapper').should('contain.text', title);
        return this;
    }

    expectHierarchyFlagsMenuTitleToBe(title: string) {
        cy.get('#hierarchyFlagsMenu .mat-button-wrapper').should('contain.text', title);
        return this;
    }

    expectHierarchyFlagsMenuToBeDisabled(disabled: boolean) {
        cy.get('#hierarchyFlagsMenu').should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectInverseLookupMenuTitleToBe(title: string) {
        cy.get('#inverseLookupMenu .mat-button-wrapper').should('contain.text', title);
        return this;
    }

    expectAdvancedFilterMenuTitleToBe(title: string) {
        cy.get('#advanceFilterMenu .mat-button-wrapper').should('contain.text', title);
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

    getSearchResult(index: number) {
        return new SearchResult(index);
    }

    expectVersionTagToExist(exist: boolean) {
        cy.get('whois-version').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectVersionTagToContain(text: string) {
        cy.get('whois-version').should('contain.text', text);
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
}

class SearchResult {
    private index: number;
    private selector = () => cy.get(`.resultpane lookup:nth(${this.index})`);

    constructor(index: number) {
        this.index = index;
    }

    expectRipeStatLinkToContain(link: string) {
        this.selector().find('a.ripe-stat-button').invoke('attr', 'href').should('contain', link);
        return this;
    }

    expectRipeManageValuesCheckboxToContain(text: string) {
        this.selector().find('whois-object-viewer .checkbox').should('contain.text', text);
        return this;
    }

    clickRipeManageValuesCheckbox() {
        this.selector().find('input').click({ force: true });
        return this;
    }

    expectManageValuesToExist(exist: boolean) {
        this.selector()
            .find('whois-object-viewer .showripemanaged')
            .should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectValueToContain(type: string, value: string) {
        this.selector().find(`whois-object-viewer li:contains('${type}')`).should('contain.text', value);
        return this;
    }

    expectValueWithLinkToContain(type: string, link: string) {
        this.selector().find(`whois-object-viewer li:contains('${type}') a`).invoke('attr', 'href').should('contain', link);
        return this;
    }
}

class TypesFilter {
    clickCheckbox(name: string) {
        cy.get(`.mat-checkbox`).contains(name).find('input').click({ force: true });
        return this;
    }

    expectCheckboxToBeDisabled(name: string, disabled: boolean) {
        cy.get(`.mat-checkbox`)
            .contains(name)
            .find('input')
            .should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectCheckboxToBeChecked(name: string, checked: boolean) {
        cy.get(`.mat-checkbox`)
            .contains(name)
            .find('input')
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
                    return 100;
                case 'L':
                    return 200;
                case 'm':
                    return 300;
                case 'M':
                    return 400;
                case 'x':
                    return 500;
            }
        })();
        cy.get(`hierarchy-flags .mat-slider-track-wrapper`).click(index, 0, { force: true });
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
        cy.get('hierarchy-flags mat-slider').should('have.attr', 'aria-valuenow', index);
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
        cy.get(`.mat-checkbox`).contains(name).find('input').click({ force: true });
        return this;
    }

    expectCheckboxToBeDisabled(name: string, disabled: boolean) {
        cy.get(`.mat-checkbox`)
            .contains(name)
            .find('input')
            .should(disabled ? 'be.disabled' : 'not.be.disabled');
        return this;
    }

    expectCheckboxToBeChecked(name: string, checked: boolean) {
        cy.get(`.mat-checkbox`)
            .contains(name)
            .find('input')
            .should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }
}

class AdvancedFilter {
    expectCheckboxDoNotRetrieveChecked(checked: boolean) {
        cy.get('#doNotRetrieveRelatedObjects .mat-checkbox-input').should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }

    clickCheckboxDoNotRetrieve() {
        cy.get('#doNotRetrieveRelatedObjects .mat-checkbox-input').click({ force: true });
        return this;
    }

    expectCheckboxShowFullObjectDetailsChecked(checked: boolean) {
        cy.get('#showFullObjectDetails .mat-checkbox-input').should(checked ? 'be.checked' : 'not.be.checked');
        return this;
    }

    clickCheckboxShowFullDetails() {
        cy.get('#showFullObjectDetails .mat-checkbox-input').click({ force: true });
        return this;
    }
}