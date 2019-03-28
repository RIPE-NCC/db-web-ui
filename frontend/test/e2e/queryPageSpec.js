/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The query pagina', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/query');
    });

    it('should have all its bits on the screen somewhere', function () {
        expect(page.inpQueryString.getAttribute('value')).toEqual('');
        expect(page.inpDontRetrieveRelated.getAttribute('value')).toEqual('on');
        expect(page.inpShowFullDetails.getAttribute('value')).toEqual('on');

        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click(); // nothing should happen, everything is ok
        expect(page.inpQueryString.getAttribute('value')).toEqual('');
        expect(page.inpDontRetrieveRelated.getAttribute('value')).toEqual('on');
        expect(page.inpShowFullDetails.getAttribute('value')).toEqual('on');
    });

    it('should be able to search using the text box', function () {
        page.inpQueryString.sendKeys('193.0.0.0\n'); // press 'enter' for a laugh
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.resultsSection);
        expect(page.searchResults.count()).toEqual(4);
        expect(page.inpQueryString.getAttribute('value')).toEqual('193.0.0.0');
    });

    it('should be able to search using the text box and a type checkbox', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.inpQueryString.getAttribute('value')).toEqual('193.0.0.0');
    });

    it('should be able to have source dynamic', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute('innerHTML')).toContain('?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation');
    });

    it('should be able to have source dynamic', function () {
        page.inpQueryString.sendKeys('223.0.0.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute('innerHTML')).toContain('?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation');
    });

    it('should search by inverse lookup abuse-c', function () {
        page.inpQueryString.sendKeys('ACRO862-RIPE');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:11')); // organisation
        page.byId('search:types:11').click();
        page.queryParamTabs.get(3).click();
        page.scrollIntoView(page.byId('search:inverseLookup:0')); // organisation
        page.byId('search:inverseLookup:0').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        var whoisObject = page.getWhoisObjectViewerOnQueryPage(0);
        expect(whoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 1).getText()).toEqual('Aloses Telekom Hizm. San. ve Tic. Ltd. Sti.');
        expect(page.inpTelnetQuery.getText()).toContain("-i abuse-c -T organisation -Br ACRO862-RIPE");
    });

    it('should be specified ripe stat link', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        var ripeStateButtonInetnum = page.getRipeStateFromWhoisObjectOnQueryPage(0);
        page.scrollIntoView(ripeStateButtonInetnum);
        expect(ripeStateButtonInetnum.isPresent()).toEqual(true);
        var urlInet = ripeStateButtonInetnum.getAttribute('href');
        expect(urlInet).toEqual('https://stat.ripe.net/193.0.0.0%20-%20193.0.0.63?sourceapp=ripedb');
        // link for route(6) should contain just route value without AS
        var ripeStateButtonRoute = page.getRipeStateFromWhoisObjectOnQueryPage(3);
        page.scrollIntoView(ripeStateButtonRoute);
        expect(ripeStateButtonRoute.isPresent()).toEqual(true);
        var urlRoute = ripeStateButtonRoute.getAttribute('href');
        expect(urlRoute).toEqual('https://stat.ripe.net/193.0.0.0/21?sourceapp=ripedb');
    });

    it('should show object banner with text - No abuse contact found', function () {
        page.inpQueryString.sendKeys('193.0.0.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        expect(page.lookupHeader.isPresent()).toEqual(true);
        expect(page.lookupHeader.getText()).toContain('No abuse contact found');
    });

    it('should show object banner with abuse contact info', function () {
        page.inpQueryString.sendKeys('193.201.0.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.lookupHeader.isPresent()).toEqual(true);
        expect(page.lookupHeader.getText()).toContain('Responsible organisation: WITBE NET S.A.');
        expect(page.lookupHeaderEmailLink.get(0).getAttribute('href')).toContain('?source=ripe&key=ORG-WA9-RIPE&type=organisation');
        expect(page.lookupHeader.getText()).toContain('Abuse contact info: lir@witbe.net');
        expect(page.lookupHeaderEmailLink.get(1).getAttribute('href')).toContain('?source=ripe&key=AR15400-RIPE&type=role');
    });

    it('should show object banner with suspected abuse contact info', function () {
        page.inpQueryString.sendKeys('223.0.0.0');
        // -- just to use same mock
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:6'));
        page.byId('search:types:6').click();
        page.scrollIntoView(page.btnSubmitQuery);
        // --
        page.btnSubmitQuery.click();
        expect(page.lookupHeader.isPresent()).toEqual(true);
        expect(page.lookupHeader.getText()).toContain('Responsible organisation: TEST ORG');
        expect(page.lookupHeaderEmailLink.get(0).getAttribute('href')).toContain('?source=ripe&key=ORG-TEST1-RIPE&type=organisation');
        expect(page.lookupHeader.getText()).toContain('Abuse contact info: abuse-c@test.net');
        expect(page.lookupHeaderEmailLink.get(1).getAttribute('href')).toContain('?source=ripe&key=ABUSE-C-RIPE&type=role');
        expect(page.lookupHeader.getText()).toContain('Abuse-mailbox validation failed. Please refer to ORG-TEST2-RIPE for further information.');
        expect(page.lookupHeaderEmailLink.get(2).getAttribute('href')).toContain('?source=ripe&key=ORG-TEST2-RIPE&type=organisation');
    });

    it('should show checkbox - Highlight RIPE NCC managed values', function () {
        page.inpQueryString.sendKeys('193.201.0.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.ripeManagedAttributesLabel.getText()).toContain('Highlight RIPE NCC managed values');
        // unselect
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(false);
        // select
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(true);

    });

    it('should be able to show out of region route from ripe db', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
        var nonRipeWhoisObject = page.getWhoisObjectViewerOnQueryPage(2);
        expect(nonRipeWhoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 7).getText()).toEqual('RIPE-NONAUTH');
        expect(page.inpQueryString.getAttribute('value')).toEqual('211.43.192.0');
    });

    it('should be able to show out of region route from ripe db without related objects', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:17'));
        page.byId('search:types:17').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 7).getText()).toEqual('RIPE-NONAUTH');
        expect(page.inpQueryString.getAttribute('value')).toEqual('211.43.192.0');
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute('href')).toEqual('https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb');
    });

    it('should contain ripe-nonauth for source in link on attribute value', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(2, 0).getAttribute('href')).toContain('?source=ripe-nonauth&key=211.43.192.0/19AS9777&type=route');
    });

    it('should contain date in proper format', function () {
        page.inpQueryString.sendKeys('211.43.192.0');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 5).getText()).toContain('1970-01-01T00:00:00Z');
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 6).getText()).toContain('2018-07-23T13:00:20Z');
    });

    it('should be able to show out of region route from ripe db without related objects', function () {
        page.inpQueryString.sendKeys('AS9777');
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId('search:types:2'));
        page.byId('search:types:2').click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 0).getAttribute('href')).toContain('?source=ripe-nonauth&key=AS9777&type=aut-num');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 9).getAttribute('href')).toContain('?source=ripe-nonauth&key=JYH3-RIPE&type=person');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 10).getAttribute('href')).toContain('?source=ripe-nonauth&key=SDH19-RIPE&type=person');
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 18).getAttribute('href')).toContain('?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner');
        expect(page.inpQueryString.getAttribute('value')).toEqual('AS9777');
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute('href')).toEqual('https://stat.ripe.net/AS9777?sourceapp=ripedb');
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 21).getText()).toEqual('RIPE-NONAUTH');
        // XML
        expect(page.lookupLinkToXmlJSON.get(1).getAttribute('href')).toContain('.xml?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE');
        // JSON
        expect(page.lookupLinkToXmlJSON.get(2).getAttribute('href')).toContain('.json?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE');
    });

    // TEMPLATE QUERY -t or --template
    it('should be able to search --template using the text box', function () {
        page.inpQueryString.sendKeys('-t person\n');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.templateSearchResults);
        expect(page.inpQueryString.getAttribute('value')).toEqual('-t person');
        expect(page.inpTelnetQuery.getText()).toEqual('-t person');
        expect(page.templateSearchResults.getText()).toEqual(
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
            'source:         [mandatory]  [single]     [ ]');
    });

    it('should not show template panel in case of error query', function () {
        page.inpQueryString.sendKeys('something -t notExistingObjectType inet6num\n');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.templateSearchResults.isPresent()).toBeFalsy();
        expect(page.inpTelnetQuery.getText()).toEqual(' ');
    });

    it('should be able to search --verbose using the text box', function () {
        page.inpQueryString.sendKeys('-t aut-num\n');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.templateSearchResults);
        expect(page.inpQueryString.getAttribute('value')).toEqual('-t aut-num');
        expect(page.inpTelnetQuery.getText()).toEqual('-t aut-num');
        expect(page.templateSearchResults.getText()).toContain('The aut-num class:');
        expect(page.templateSearchResults.getText()).toContain('An object of the aut-num class is a database representation of');
        expect(page.templateSearchResults.getText()).toContain('A descriptive name associated with an AS.');
        expect(page.templateSearchResults.getText()).toContain('any as-any rs-any peeras and or not atomic from to at');
        expect(page.templateSearchResults.getText()).toContain('registry name must be a letter or a digit.');
    });

    //--resource in query
    it('should be able to search --resource (source=GRS) using the text box', function () {
        page.inpQueryString.sendKeys('1.1.1.1 --resource\n');
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.inpQueryString.getAttribute('value')).toEqual('1.1.1.1 --resource');
        expect(page.inpTelnetQuery.getText()).toEqual('-B --resource 1.1.1.1');
        expect(page.searchResults.count()).toEqual(3);
    });
});
