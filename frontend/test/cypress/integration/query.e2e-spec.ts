import { QueryPage } from '../pages/query.page';

describe('Query scenario', () => {
    const queryPage = new QueryPage();

    beforeEach(() => {
        queryPage.visit();
    });

    it('should set focus on search field when visiting the page', () => {
        queryPage.expectSearchToHaveFocus();
    });

    it('should reset all dropdowns checkboxes to default on click Reset filters button', () => {
        queryPage.typeSearchTerm('223.0.0.0 all').clickOnSearchButton();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('as-block').clickCheckbox('as-set').clickCheckbox('aut-num');
        queryPage.clickOnTypesFilterDropdown();

        queryPage.clickOnInverseLookupFilterDropdown().clickCheckbox('abuse-c').clickCheckbox('admin-c');
        queryPage.clickOnInverseLookupFilterDropdown();

        queryPage.clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnAdvancedFilterDropdown();

        queryPage
            .expectTypesMenuTitleToBe('Types (3)')
            .expectInverseLookupMenuTitleToBe('Inverse lookup (2)')
            .expectAdvancedFilterMenuTitleToBe('Advanced filter (1)');
        queryPage.clickOnReset();

        queryPage.expectTypesMenuTitleToBe('Types').expectInverseLookupMenuTitleToBe('Inverse lookup').expectAdvancedFilterMenuTitleToBe('Advanced filter');
        queryPage
            .clickOnTypesFilterDropdown()
            .expectCheckboxToBeChecked('as-block', false)
            .expectCheckboxToBeChecked('as-set', false)
            .expectCheckboxToBeChecked('aut-num', false);
        queryPage.clickOnInverseLookupFilterDropdown().expectCheckboxToBeChecked('abuse-c', false).expectCheckboxToBeChecked('admin-c', false);
        queryPage.clickOnAdvancedFilterDropdown().expectCheckboxShowFullObjectDetailsChecked(false);
    });

    it('should disable Reset filters if there is no selected checkboxes in filters dropdowns, Apply Filters always enabled', () => {
        queryPage
            .typeSearchTerm('223.0.0.0 all')
            .clickOnSearchButton()
            .expectApplyFiltersDisabled(false)
            .expectResetDisabled(true)
            .clickOnTypesFilterDropdown()
            .clickCheckbox('as-block')
            .clickCheckbox('as-set');
        queryPage.expectApplyFiltersDisabled(false).expectResetDisabled(false).clickOnReset().expectApplyFiltersDisabled(false).expectResetDisabled(true);
    });

    it('should uncheck checkbox when search term change', () => {
        const typeDropdown = queryPage
            .typeSearchTerm('223.0.0.0 all')
            .clickOnSearchButton()
            .expectNoResults()
            .clickOnTypesFilterDropdown()
            .clickCheckbox('as-block')
            .clickCheckbox('domain');
        queryPage.typeSearchTerm('223.0.0.0');

        typeDropdown
            .expectCheckboxToBeDisabled('as-block', true)
            .expectCheckboxToBeDisabled('domain', false)
            .expectCheckboxToBeChecked('as-block', false)
            .expectCheckboxToBeChecked('domain', false);
    });

    it('should disable checkbox when search term change according to object type of search term', () => {
        const typeDropdown = queryPage
            .typeSearchTerm('223.0.0.0 all')
            .clickOnSearchButton()
            .expectNoResults()
            .clickOnTypesFilterDropdown()
            .clickCheckbox('mntner');
        queryPage.typeSearchTerm('223.0.0.0');

        typeDropdown.expectCheckboxToBeDisabled('mntner', true).expectCheckboxToBeChecked('mntner', false);

        queryPage.typeSearchTerm('ANNA-MNT');
        typeDropdown.clickCheckbox('mntner').expectCheckboxToBeDisabled('mntner', false).expectCheckboxToBeChecked('mntner', true);
    });

    it('should have share button disable if there is no results', () => {
        queryPage.typeSearchTerm('223.0.0.0 all').clickOnSearchButton().expectShareButtonDisabled(true);
    });

    it('should have share button enabled if there is results', () => {
        queryPage.typeSearchTerm('AS9777').clickOnSearchButton().expectShareButtonDisabled(false);
    });

    it('should contain perm, xml and json links in Share Panel', () => {
        queryPage
            .typeSearchTerm('AS9777')
            .clickOnSearchButton()
            .clickOnShareButton()
            .expectPermaLinkToContain('/db-web-ui/query?searchtext=AS9777&rflag=true&source=RIPE&bflag=false')
            .expectJsonLinkToContain('.json?query-string=AS9777&flags=no-referenced&flags=no-irt&source=RIPE')
            .expectXmlLinkToContain('.xml?query-string=AS9777&flags=no-referenced&flags=no-irt&source=RIPE')
            .clickOnCopyUrlButton();

        // TODO missing check content of the clipboard, the following code required browser permissions
        // cy.window().then(async win => {
        //     window.document.getElementsByTagName('body')[0].focus();
        //     const copiedLink = await win.navigator.clipboard.readText();
        //     assert.equal(copiedLink, 'blbla')
        // })
    });

    it('should be specified ripe stat link', () => {
        queryPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails().clickCheckboxDoNotRetrieve();
        queryPage.clickOnSearchButton();
        // ripe stat link for should contain inetnum
        queryPage.getSearchResult(0).expectRipeStatLinkToContain('https://stat.ripe.net/193.0.0.0 - 193.0.0.63?sourceapp=ripedb');

        // link for route(6) should contain just route value without AS
        queryPage.getSearchResult(3).expectRipeStatLinkToContain('https://stat.ripe.net/193.0.0.0/21?sourceapp=ripedb');
    });

    it("shouldn't show banner with ERORR:101 but 'No results..' message in panel", () => {
        queryPage.typeSearchTerm('223.0.0.0 all').clickOnSearchButton().expectNoResults().expectNoErrorMessage();
    });

    it('should show object banner with text - No abuse contact found', () => {
        queryPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails().clickCheckboxDoNotRetrieve();
        queryPage.clickOnSearchButton().expectSearchHeaderToContain('No abuse contact found');
    });

    it('should show object banner with abuse contact info', () => {
        queryPage
            .typeSearchTerm('193.201.0.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage
            .clickOnSearchButton()
            .expectSearchHeaderToContain('Responsible organisation: WITBE NET S.A.')
            .expectSearchHeaderToContain('Abuse contact info: lir@witbe.net')
            .expectSearchHeaderLinkToContain('lookup?source=ripe&key=ORG-WA9-RIPE&type=organisation', 0)
            .expectSearchHeaderLinkToContain('lookup?source=ripe&key=AR15400-RIPE&type=role', 1);
    });

    it('should show object banner with suspected abuse contact info', () => {
        queryPage.typeSearchTerm('223.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('inetnum');
        queryPage
            .clickOnSearchButton()
            .expectSearchHeaderToContain('Responsible organisation: TEST ORG')
            .expectSearchHeaderToContain('Abuse contact info: abuse-c@test.net')
            .expectSearchHeaderToContain('Abuse-mailbox validation failed. Please refer to ORG-TEST2-RIPE for further information.')
            .expectSearchHeaderLinkToContain('lookup?source=ripe&key=ORG-TEST1-RIPE&type=organisation', 0)
            .expectSearchHeaderLinkToContain('lookup?source=ripe&key=ABUSE-C-RIPE&type=role', 1)
            .expectSearchHeaderLinkToContain('lookup?source=ripe&key=ORG-TEST2-RIPE&type=organisation', 2);
    });

    it('should show checkbox - Highlight RIPE NCC managed values', () => {
        queryPage
            .typeSearchTerm('193.201.0.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage
            .clickOnSearchButton()
            .getSearchResult(0)
            .expectRipeManageValuesCheckboxToContain('Highlight RIPE NCC managed values')
            .clickRipeManageValuesCheckbox()
            .expectManageValuesToExist(false)
            .clickRipeManageValuesCheckbox()
            .expectManageValuesToExist(true);
    });

    it('should be able to show out of region route from ripe db', () => {
        queryPage
            .typeSearchTerm('211.43.192.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage
            .clickOnSearchButton()
            .expectNumberOfResults(3)
            .getSearchResult(2)
            .expectValueToContain('source', 'RIPE-NONAUTH')
            .expectValueToContain('route', '211.43.192.0');
    });

    it('should be able to show out of region route from ripe db without related objects', () => {
        queryPage.typeSearchTerm('211.43.192.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('route');
        queryPage
            .clickOnSearchButton()
            .expectNumberOfResults(1)
            .getSearchResult(0)
            .expectValueToContain('source', 'RIPE-NONAUTH')
            .expectValueToContain('route', '211.43.192.0')
            .expectRipeStatLinkToContain('https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb');
    });

    it('should contain ripe-nonauth for source in link on attribute value', () => {
        queryPage
            .typeSearchTerm('211.43.192.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage
            .clickOnSearchButton()
            .getSearchResult(2)
            .expectValueToContain('route', '211.43.192.0')
            .expectValueWithLinkToContain('route', '?source=ripe-nonauth&key=211.43.192.0%2F19AS9777&type=route');
    });

    it('should contain date in proper format', () => {
        queryPage
            .typeSearchTerm('211.43.192.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage
            .clickOnSearchButton()
            .getSearchResult(2)
            .expectValueToContain('created', '1970-01-01T00:00:00Z')
            .expectValueToContain('last-modified', '2018-07-23T13:00:20Z');
    });

    it('should be able to show out of region route from ripe db without related objects', () => {
        queryPage.typeSearchTerm('AS9777').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('aut-num');
        queryPage
            .clickOnSearchButton()
            .expectNumberOfResults(1)
            .getSearchResult(0)
            .expectValueWithLinkToContain('aut-num', '?source=ripe-nonauth&key=AS9777&type=aut-num')
            .expectValueWithLinkToContain('admin-c', '?source=ripe-nonauth&key=JYH3-RIPE&type=person')
            .expectValueWithLinkToContain('tech-c', '?source=ripe-nonauth&key=SDH19-RIPE&type=person')
            .expectValueWithLinkToContain('mnt-by', '?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner');

        queryPage
            .expectSearchTerm('AS9777')
            .getSearchResult(0)
            .expectRipeStatLinkToContain('https://stat.ripe.net/AS9777?sourceapp=ripedb')
            .expectValueToContain('source', 'RIPE-NONAUTH');

        queryPage
            .clickOnShareButton()
            .expectXmlLinkToContain('.xml?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE')
            .expectJsonLinkToContain('.json?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE');
    });

    it('should show version of whois after searching', () => {
        queryPage
            .expectVersionTagToExist(false)
            .typeSearchTerm('211.43.192.0')
            .clickOnSearchButton()
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails()
            .clickCheckboxDoNotRetrieve();
        queryPage.clickOnSearchButton().expectVersionTagToExist(true).expectVersionTagToContain('RIPE Database Software Version 1.97-SNAPSHOT');
    });

    it('should have all its bits on the screen somewhere', () => {
        queryPage
            .expectSearchFieldToBeEmpty()
            .expectDropdownFiltersToExist(false)
            .clickOnSearchButton()
            .expectSearchFieldToBeEmpty()
            .expectDropdownFiltersToExist(false)
            .typeSearchTerm('193.0.0.0')
            .clickOnSearchButton()
            .expectDropdownFiltersToExist(true)
            .clickOnAdvancedFilterDropdown()
            .expectCheckboxDoNotRetrieveChecked(true)
            .expectCheckboxShowFullObjectDetailsChecked(false);
    });

    it('should be able to search using the text box', () => {
        queryPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails().clickCheckboxDoNotRetrieve();
        queryPage.clickOnSearchButton().expectNumberOfResults(4);
    });

    it('should be able to search using the text box and a type checkbox', () => {
        queryPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('inetnum');
        queryPage.clickOnSearchButton().expectNumberOfResults(1).expectSearchTerm('193.0.0.0');

        cy.expectCurrentUrlToContain('193.0.0.0').expectCurrentUrlToContain('types=inetnum');
    });

    it('should be able to have source dynamic', () => {
        queryPage.typeSearchTerm('193.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('inetnum');
        queryPage.clickOnSearchButton().expectSearchHeaderLinkToContain('lookup?source=ripe&key=ORG-IANA1-RIPE&type=organisation');
    });

    it('should be able to have source dynamic', () => {
        queryPage.typeSearchTerm('223.0.0.0').clickOnSearchButton().clickOnAdvancedFilterDropdown().clickCheckboxShowFullDetails();
        queryPage.clickOnTypesFilterDropdown().clickCheckbox('inetnum');
        queryPage.clickOnSearchButton().expectSearchHeaderLinkToContain('lookup?source=ripe&key=ORG-TEST1-RIPE&type=organisation');
    });

    it('should search by inverse lookup abuse-c', () => {
        queryPage
            .typeSearchTerm('AR24917-RIPE')
            .clickOnSearchButton()
            .expectAdvancedFilterMenuTitleToBe('Advanced filter')
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails();
        queryPage
            .expectAdvancedFilterMenuTitleToBe('Advanced filter (1)')
            .expectTypesMenuTitleToBe('Types')
            .clickOnTypesFilterDropdown()
            .clickCheckbox('organisation');
        queryPage
            .expectTypesMenuTitleToBe('Types (1)')
            .expectInverseLookupMenuTitleToBe('Inverse lookup')
            .clickOnInverseLookupFilterDropdown()
            .clickCheckbox('abuse-c');
        queryPage
            .expectInverseLookupMenuTitleToBe('Inverse lookup (1)')
            .clickOnSearchButton()
            .expectNumberOfResults(1)
            .expectWhoisObjectViewerComponentPresentInResults()
            .expectResultToContainText(0, 'Metropolitan Networks UK Ltd')
            .expectQueryFlagsContainerVisible(false);
    });

    it('should not count default values as selected items in advanced filter dropdown', () => {
        queryPage
            .typeSearchTerm('AR24917-RIPE')
            .clickOnSearchButton()
            .expectAdvancedFilterMenuTitleToBe('Advanced filter')
            .clickOnAdvancedFilterDropdown()
            .clickCheckboxShowFullDetails();
        queryPage.clickOnAdvancedFilterDropdown(); // just to close
        queryPage.expectAdvancedFilterMenuTitleToBe('Advanced filter (1)').clickOnAdvancedFilterDropdown().clickCheckboxDoNotRetrieve();
        queryPage.expectAdvancedFilterMenuTitleToBe('Advanced filter (2)');
    });

    it('should have disabled hierarchy tab - when search term is recognised like type from ObjectTypesEnum and is not inetnum, inet6num, domain, route, route6', () => {
        queryPage
            .typeSearchTerm('AR24917-RIPE')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            .expectHierarchyFlagsMenuToBeDisabled(true);
    });

    it('should have enabled hierarchy tab when search term is not recognised as type inetnum, inet6num, domain, route or route6, organisation, person/role or maintainer', () => {
        queryPage
            .typeSearchTerm('223.0.0.0 something')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            .expectHierarchyFlagsMenuToBeDisabled(false);
    });

    it('should have enabled all checkbox in Types dropdown and Inverse Lookup when search term is not recognised as type inetnum, inet6num, domain, route or route6, organisation, person/role or maintainer', () => {
        queryPage
            .typeSearchTerm('223.0.0.0 something')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            .expectHierarchyFlagsMenuToBeDisabled(false)
            .clickOnTypesFilterDropdown()
            .expectCheckboxToBeDisabled('as-block', false)
            .expectCheckboxToBeDisabled('as-set', false)
            .expectCheckboxToBeDisabled('aut-num', false)
            .expectCheckboxToBeDisabled('domain', false)
            .expectCheckboxToBeDisabled('filter-set', false)
            .expectCheckboxToBeDisabled('inet6num', false)
            .expectCheckboxToBeDisabled('inetnum', false)
            .expectCheckboxToBeDisabled('inet-rtr', false)
            .expectCheckboxToBeDisabled('irt', false)
            .expectCheckboxToBeDisabled('key-cert', false)
            .expectCheckboxToBeDisabled('mntner', false)
            .expectCheckboxToBeDisabled('organisation', false)
            .expectCheckboxToBeDisabled('peering-set', false)
            .expectCheckboxToBeDisabled('person', false)
            .expectCheckboxToBeDisabled('poem', false)
            .expectCheckboxToBeDisabled('poetic-form', false)
            .expectCheckboxToBeDisabled('role', false)
            .expectCheckboxToBeDisabled('route', false)
            .expectCheckboxToBeDisabled('route6', false)
            .expectCheckboxToBeDisabled('route-set', false)
            .expectCheckboxToBeDisabled('rtr-set', false);
        queryPage
            .clickOnInverseLookupFilterDropdown()
            .expectCheckboxToBeDisabled('abuse-c', false)
            .expectCheckboxToBeDisabled('abuse-mailbox', false)
            .expectCheckboxToBeDisabled('admin-c', false)
            .expectCheckboxToBeDisabled('auth', false)
            .expectCheckboxToBeDisabled('author', false)
            .expectCheckboxToBeDisabled('fingerpr', false)
            .expectCheckboxToBeDisabled('form', false)
            .expectCheckboxToBeDisabled('irt-nfy', false)
            .expectCheckboxToBeDisabled('local-as', false)
            .expectCheckboxToBeDisabled('mbrs-by-ref', false)
            .expectCheckboxToBeDisabled('member-of', false)
            .expectCheckboxToBeDisabled('mnt-by', false)
            .expectCheckboxToBeDisabled('mnt-domains', false)
            .expectCheckboxToBeDisabled('mnt-irt', false)
            .expectCheckboxToBeDisabled('mnt-lower', false)
            .expectCheckboxToBeDisabled('mnt-nfy', false)
            .expectCheckboxToBeDisabled('mnt-ref', false)
            .expectCheckboxToBeDisabled('mnt-routes', false)
            .expectCheckboxToBeDisabled('notify', false)
            .expectCheckboxToBeDisabled('nserver', false)
            .expectCheckboxToBeDisabled('org', false)
            .expectCheckboxToBeDisabled('origin', false)
            .expectCheckboxToBeDisabled('person', false)
            .expectCheckboxToBeDisabled('ping-hdl', false)
            .expectCheckboxToBeDisabled('ref-nfy', false)
            .expectCheckboxToBeDisabled('tech-c', false)
            .expectCheckboxToBeDisabled('upd-to', false)
            .expectCheckboxToBeDisabled('zone-c', false);
    });

    it('should have enabled just person/role, role and organisation checkbox in Types dropdown when type is person', () => {
        queryPage
            .typeSearchTerm('AR24917-RIPE')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            .expectHierarchyFlagsMenuToBeDisabled(true)
            .clickOnTypesFilterDropdown()
            .expectCheckboxToBeDisabled('as-block', true)
            .expectCheckboxToBeDisabled('as-set', true)
            .expectCheckboxToBeDisabled('aut-num', true)
            .expectCheckboxToBeDisabled('domain', true)
            .expectCheckboxToBeDisabled('filter-set', true)
            .expectCheckboxToBeDisabled('inet6num', true)
            .expectCheckboxToBeDisabled('inetnum', true)
            .expectCheckboxToBeDisabled('inet-rtr', true)
            .expectCheckboxToBeDisabled('irt', true)
            .expectCheckboxToBeDisabled('key-cert', true)
            .expectCheckboxToBeDisabled('mntner', true)
            .expectCheckboxToBeDisabled('organisation', false)
            .expectCheckboxToBeDisabled('peering-set', true)
            .expectCheckboxToBeDisabled('person', false)
            .expectCheckboxToBeDisabled('poem', true)
            .expectCheckboxToBeDisabled('poetic-form', true)
            .expectCheckboxToBeDisabled('role', false)
            .expectCheckboxToBeDisabled('route', true)
            .expectCheckboxToBeDisabled('route6', true)
            .expectCheckboxToBeDisabled('route-set', true)
            .expectCheckboxToBeDisabled('rtr-set', true);
        queryPage
            .clickOnInverseLookupFilterDropdown()
            .expectCheckboxToBeDisabled('abuse-c', false)
            .expectCheckboxToBeDisabled('abuse-mailbox', false)
            .expectCheckboxToBeDisabled('admin-c', false)
            .expectCheckboxToBeDisabled('auth', true)
            .expectCheckboxToBeDisabled('author', true)
            .expectCheckboxToBeDisabled('fingerpr', true)
            .expectCheckboxToBeDisabled('form', true)
            .expectCheckboxToBeDisabled('irt-nfy', true)
            .expectCheckboxToBeDisabled('local-as', true)
            .expectCheckboxToBeDisabled('mbrs-by-ref', true)
            .expectCheckboxToBeDisabled('member-of', true)
            .expectCheckboxToBeDisabled('mnt-by', false)
            .expectCheckboxToBeDisabled('mnt-domains', true)
            .expectCheckboxToBeDisabled('mnt-irt', true)
            .expectCheckboxToBeDisabled('mnt-lower', true)
            .expectCheckboxToBeDisabled('mnt-nfy', true)
            .expectCheckboxToBeDisabled('mnt-ref', false)
            .expectCheckboxToBeDisabled('mnt-routes', true)
            .expectCheckboxToBeDisabled('notify', false)
            .expectCheckboxToBeDisabled('nserver', true)
            .expectCheckboxToBeDisabled('org', false)
            .expectCheckboxToBeDisabled('origin', true)
            .expectCheckboxToBeDisabled('person', false)
            .expectCheckboxToBeDisabled('ping-hdl', true)
            .expectCheckboxToBeDisabled('ref-nfy', false)
            .expectCheckboxToBeDisabled('tech-c', false)
            .expectCheckboxToBeDisabled('upd-to', true)
            .expectCheckboxToBeDisabled('zone-c', true);
    });

    it('should have enabled just inetnum, route and domain checkbox in Types dropdown when type is inetnum', () => {
        queryPage
            .typeSearchTerm('223.0.0.0')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            .expectHierarchyFlagsMenuToBeDisabled(false)
            .clickOnTypesFilterDropdown()
            .expectCheckboxToBeDisabled('as-block', true)
            .expectCheckboxToBeDisabled('as-set', true)
            .expectCheckboxToBeDisabled('aut-num', true)
            .expectCheckboxToBeDisabled('domain', false)
            .expectCheckboxToBeDisabled('filter-set', true)
            .expectCheckboxToBeDisabled('inet6num', true)
            .expectCheckboxToBeDisabled('inetnum', false)
            .expectCheckboxToBeDisabled('inet-rtr', true)
            .expectCheckboxToBeDisabled('irt', true)
            .expectCheckboxToBeDisabled('key-cert', true)
            .expectCheckboxToBeDisabled('mntner', true)
            .expectCheckboxToBeDisabled('organisation', true)
            .expectCheckboxToBeDisabled('peering-set', true)
            .expectCheckboxToBeDisabled('person', true)
            .expectCheckboxToBeDisabled('poem', true)
            .expectCheckboxToBeDisabled('poetic-form', true)
            .expectCheckboxToBeDisabled('role', true)
            .expectCheckboxToBeDisabled('route', false)
            .expectCheckboxToBeDisabled('route6', true)
            .expectCheckboxToBeDisabled('route-set', true)
            .expectCheckboxToBeDisabled('rtr-set', true);
        queryPage.clickOnTypesFilterDropdown(); // close
        queryPage
            .clickOnInverseLookupFilterDropdown()
            .expectCheckboxToBeDisabled('abuse-c', false)
            .expectCheckboxToBeDisabled('abuse-mailbox', true)
            .expectCheckboxToBeDisabled('admin-c', false)
            .expectCheckboxToBeDisabled('auth', true)
            .expectCheckboxToBeDisabled('author', true)
            .expectCheckboxToBeDisabled('fingerpr', true)
            .expectCheckboxToBeDisabled('form', true)
            .expectCheckboxToBeDisabled('irt-nfy', true)
            .expectCheckboxToBeDisabled('local-as', true)
            .expectCheckboxToBeDisabled('mbrs-by-ref', true)
            .expectCheckboxToBeDisabled('member-of', false)
            .expectCheckboxToBeDisabled('mnt-by', false)
            .expectCheckboxToBeDisabled('mnt-domains', false)
            .expectCheckboxToBeDisabled('mnt-irt', false)
            .expectCheckboxToBeDisabled('mnt-lower', false)
            .expectCheckboxToBeDisabled('mnt-nfy', true)
            .expectCheckboxToBeDisabled('mnt-ref', true)
            .expectCheckboxToBeDisabled('mnt-routes', false)
            .expectCheckboxToBeDisabled('notify', false)
            .expectCheckboxToBeDisabled('nserver', false)
            .expectCheckboxToBeDisabled('org', false)
            .expectCheckboxToBeDisabled('origin', false)
            .expectCheckboxToBeDisabled('person', true)
            .expectCheckboxToBeDisabled('ping-hdl', false)
            .expectCheckboxToBeDisabled('ref-nfy', true)
            .expectCheckboxToBeDisabled('tech-c', false)
            .expectCheckboxToBeDisabled('upd-to', true)
            .expectCheckboxToBeDisabled('zone-c', false);
        queryPage.clickOnInverseLookupFilterDropdown(); // close
    });

    it('should have selected No hierarchy flag by default on hierarchy tab', () => {
        queryPage
            .typeSearchTerm('223.0.0.0')
            .clickOnSearchButton()
            .expectHierarchyFlagsMenuTitleToBe('Hierarchy flags')
            // should have enabled hierarchy tab - when search term is recognised like type inetnum, inet6num, domain, route or route6
            .expectHierarchyFlagsMenuToBeDisabled(false)
            // click on Hierarchy flags tab
            .clickOnHierarchyFlagsDropdown()
            .expectHierarchyFlagsToBeDisplayed()
            .expectHierarchyFlagSliderToBe('No')
            .expectHierarchyFlagDescriptionText('No hierarchy flag (default).')
            .expectHierarchyDCheckBoxInputChecked(false);
    });

    it('should not uncheck domain flag when hierarchical flag is unselected', () => {
        queryPage
            .typeSearchTerm('223.0.0.0')
            .clickOnSearchButton()
            // click on Hierarchy flags tab
            .clickOnHierarchyFlagsDropdown()
            .expectHierarchyFlagsToBeDisplayed()
            .expectHierarchyFlagSliderToBe('No')
            .clickFlag('x')
            .expectHierarchyFlagSliderToBe('x')
            .expectHierarchyDCheckBoxEnabled(true)
            .clickHierarchyDCheckBox()
            .clickFlag('L');
        queryPage.expectHierarchyFlagsMenuDropdownToContain('Hierarchy flags (2)');
    });

    it('should not duplicate results on click on apply filter', () => {
        queryPage.typeSearchTerm('223.0.0.0').clickOnSearchButton().expectNumberOfResults(1).clickOnApplyFilters().expectNumberOfResults(1);
    });

    // TEMPLATE QUERY -t or --template
    it('should be able to search --template using the text box', () => {
        queryPage.typeSearchTerm('-t person').clickOnSearchButton().expectSearchTerm('-t person');
        queryPage.expectTemplateSearchResultToContain(
            'person:         [mandatory]  [single]     [lookup key]\n' +
                'address:        [mandatory]  [multiple]   [ ]\n' +
                'phone:          [mandatory]  [multiple]   [ ]\n' +
                'fax-no:         [optional]   [multiple]   [ ]\n' +
                'e-mail:         [optional]   [multiple]   [lookup key]\n' +
                'org:            [optional]   [multiple]   [inverse key]\n' +
                'nic-hdl:        [mandatory]  [single]     [primary/lookup key]\n' +
                'remarks:        [optional]   [multiple]   [ ]\n' +
                'notify:         [optional]   [multiple]   [inverse key]\n' +
                'mnt-by:         [mandatory]  [multiple]   [inverse key]\n' +
                'created:        [generated]  [single]     [ ]\n' +
                'last-modified:  [generated]  [single]     [ ]\n' +
                'source:         [mandatory]  [single]     [ ]',
        );
    });

    it('should not show template panel in case of error query', () => {
        queryPage
            .typeSearchTerm('something -t notExistingObjectType inet6num')
            .clickOnSearchButton()
            .expectNoResults()
            .expectTemplateSearchResultToExist(false)
            .expectQueryFlagsContainerVisible(true);
    });

    it('should be able to search --template using the text box', () => {
        queryPage
            .typeSearchTerm('-t aut-num')
            .clickOnSearchButton()
            .expectQueryFlagsContainerVisible(true)
            .expectTemplateSearchResultToContain('The aut-num class:')
            .expectTemplateSearchResultToContain('An object of the aut-num class is a database representation of')
            .expectTemplateSearchResultToContain('A descriptive name associated with an AS.')
            .expectTemplateSearchResultToContain('any as-any rs-any peeras and or not atomic from to at')
            .expectTemplateSearchResultToContain('registry name must be a letter or a digit.');
    });

    it('should hide template search result after new query is triggered', () => {
        queryPage
            .typeSearchTerm('-t aut-num')
            .clickOnSearchButton()
            .expectTemplateSearchResultToExist(true)
            .typeSearchTerm('211.43.192.0')
            .clickOnSearchButton()
            .expectTemplateSearchResultToExist(false);
    });

    //--resource in query
    it('should be able to search --resource (source=GRS) using the text box', () => {
        queryPage.typeSearchTerm('1.1.1.1 --resource').expectQueryFlagsContainerVisible(true).clickOnSearchButton().expectNumberOfResults(3);
    });

    //query-flags-container
    it('should show query-flags-container and disable rest of search form', () => {
        queryPage
            .typeSearchTerm('-i abuse-c -T organisation -Br --sources RIPE ANNA')
            .expectQueryFlagsContainerVisible(true)
            .expectTypesFilterDropdownToExist(false)
            .expectHierarchyFlagsDropdownToExist(false)
            .expectInverseLookupFilterDropdownToExist(false)
            .expectAdvancedFilterDropdownToExist(false);
    });

    it('should show query-flags-container with adequate flags', () => {
        queryPage
            .typeSearchTerm('-i abuse-c -T organisation -Br --sources RIPE ANNA')
            .expectQueryFlagsContainerVisible(true)
            .expectQueryFlagToContain(0, '-i')
            .expectQueryFlagToContain(1, '--inverse')
            .expectQueryFlagToContain(2, '-T')
            .expectQueryFlagToContain(3, '--select-types')
            .expectQueryFlagToContain(4, '-B')
            .expectQueryFlagToContain(5, '--no-filtering')
            .expectQueryFlagToContain(6, '-r')
            .expectQueryFlagToContain(7, '--no-referenced')
            .expectQueryFlagToContain(8, '-s')
            .expectQueryFlagToContain(9, '--sources');
    });

    it('should show error banner when flag is invalid and valid flag in query flag container', () => {
        queryPage
            .typeSearchTerm('-z --sources RIPE ANNA')
            .expectQueryFlagsContainerVisible(true)
            .expectQueryFlagToContain(0, '-s')
            .expectQueryFlagToContain(1, '--sources')
            .clickOnSearchButton()
            .expectErrorMessageToContain('ERROR:111: invalid option supplied. Use help query to see the valid options.');
    });
});
