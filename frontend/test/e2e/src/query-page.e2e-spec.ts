import {browser} from "protractor";

const page = require("./homePageObject");

describe("The query pagina", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "query");
    });

    it("should have all its bits on the screen somewhere", () => {
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        expect(page.inpDontRetrieveRelated.getAttribute("value")).toEqual("on");
        expect(page.inpShowFullDetails.getAttribute("value")).toEqual("on");

        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click(); // nothing should happen, everything is ok
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        expect(page.inpDontRetrieveRelated.getAttribute("value")).toEqual("on");
        expect(page.inpShowFullDetails.getAttribute("value")).toEqual("on");
    });

    it("should be able to search using the text box", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0"); // press "enter" for a laugh
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.resultsSection);
        expect(page.searchResults.count()).toEqual(4);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
    });

    it("should be able to search using the text box and a type checkbox", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:6"));
        page.byId("search:types:6").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
    });

    it("should be able to have source dynamic", () => {
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.inpShowFullDetails.click();
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:6"));
        page.byId("search:types:6").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should be able to have source dynamic", () => {
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpQueryString.sendKeys("223.0.0.0");
        page.inpShowFullDetails.click();
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:6"));
        page.byId("search:types:6").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should search by inverse lookup abuse-c", () => {
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpQueryString.sendKeys("ACRO862-RIPE");
        page.inpShowFullDetails.click();
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:11")); // organisation
        page.byId("search:types:11").click();
        page.queryParamTabs.get(3).click();
        page.scrollIntoView(page.byId("search:inverseLookup:0")); // organisation
        page.byId("search:inverseLookup:0").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        const whoisObject = page.getWhoisObjectViewerOnQueryPage(0);
        expect(whoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 1).getText()).toEqual("Aloses Telekom Hizm. San. ve Tic. Ltd. Sti.");
        expect(page.inpTelnetQuery.getText()).toContain("-i abuse-c -T organisation -Br --sources RIPE ACRO862-RIPE");
    });

    it("should have selected No hierarchy flag by default on hierarchy tab", () => {
        page.scrollIntoView(page.queryParamTabs.get(2));
        // click on Hierarchy flags tab
        page.queryParamTabs.get(2).click();
        expect(page.byName("hierarchyFlags").isDisplayed()).toBeTruthy();
        expect(page.byId("all").isSelected()).toBeTruthy();
        expect(page.byName("hierarchyD").isEnabled()).toBeFalsy();
    });

    it("should uncheck domain flag when hierarchial flag is unselected", () => {
        // click on Hierarchy flags tab
        page.scrollIntoView(page.queryParamTabs.get(2));
        page.queryParamTabs.get(2).click();
        expect(page.byName("hierarchyFlags").isDisplayed()).toBeTruthy();
        expect(page.byId("all").isSelected()).toBeTruthy();
        page.scrollIntoView(page.byId("all-less"));
        page.byId("all-less").click();
        expect(page.byId("all-less").isSelected()).toBeTruthy();
        page.scrollIntoView(page.byName("hierarchyD"));
        expect(page.byName("hierarchyD").isEnabled()).toBeTruthy();
        page.byName("hierarchyD").click();
        expect(page.byName("hierarchyD").isSelected()).toBeTruthy();
        page.scrollIntoView(page.byId("all"));
        page.byId("all").click();
        expect(page.byId("all").isSelected()).toBeTruthy();
        expect(page.byId("all-less").isSelected()).toBeFalsy();
        page.scrollIntoView(page.byName("hierarchyD"));
        expect(page.byName("hierarchyD").isSelected()).toBeFalsy();
        expect(page.byName("hierarchyD").isEnabled()).toBeFalsy();
    });

    it("should display selected option in telnet query view only when query string exist", () => {
        page.inpQueryString.sendKeys("193.0.0.0");
        page.scrollIntoView(page.queryParamTabs.get(2));
        // click on Hierarchy flags tab
        page.queryParamTabs.get(2).click();
        expect(page.byName("hierarchyFlags").isDisplayed()).toBeTruthy();
        page.scrollIntoView(page.byId("one-more"));
        page.byId("one-more").click();
        expect(page.byId("one-more").isSelected()).toBeTruthy();
        expect(page.byName("hierarchyD").isEnabled()).toBeTruthy();
        expect(page.inpTelnetQuery.getText()).toContain("-mr --sources RIPE 193.0.0.0");
        page.scrollIntoView(page.inpTelnetQuery);
        page.byName("hierarchyD").click();
        expect(page.inpTelnetQuery.getText()).toContain("-mdr --sources RIPE 193.0.0.0");
        page.byId("exact").click();
        expect(page.byId("exact").isSelected()).toBeTruthy();
        expect(page.inpTelnetQuery.getText()).toContain("-xdr --sources RIPE 193.0.0.0");
    });

    it("should be specified ripe stat link", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        const ripeStateButtonInetnum = page.getRipeStateFromWhoisObjectOnQueryPage(0);
        page.scrollIntoView(ripeStateButtonInetnum);
        expect(ripeStateButtonInetnum.isPresent()).toEqual(true);
        const urlInet = ripeStateButtonInetnum.getAttribute("href");
        expect(urlInet).toEqual("https://stat.ripe.net/193.0.0.0%20-%20193.0.0.63?sourceapp=ripedb");
        // link for route(6) should contain just route value without AS
        const ripeStateButtonRoute = page.getRipeStateFromWhoisObjectOnQueryPage(3);
        page.scrollIntoView(ripeStateButtonRoute);
        expect(ripeStateButtonRoute.isPresent()).toEqual(true);
        const urlRoute = ripeStateButtonRoute.getAttribute("href");
        expect(urlRoute).toEqual("https://stat.ripe.net/193.0.0.0/21?sourceapp=ripedb");
    });

    it("should show object banner with text - No abuse contact found", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("No abuse contact found");
    });

    it("should show object banner with abuse contact info", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("Responsible organisation: WITBE NET S.A.");
        expect(page.lookupHeaderEmailLink.get(0).getAttribute("href")).toContain("?source=ripe&key=ORG-WA9-RIPE&type=organisation");
        expect(page.lookupHeaderQueryPage.getText()).toContain("Abuse contact info: lir@witbe.net");
        expect(page.lookupHeaderEmailLink.get(1).getAttribute("href")).toContain("?source=ripe&key=AR15400-RIPE&type=role");
    });

    it("should show object banner with suspected abuse contact info", () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpShowFullDetails.click();
        // -- just to use same mock
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:6"));
        page.byId("search:types:6").click();
        page.scrollIntoView(page.btnSubmitQuery);
        // --
        page.btnSubmitQuery.click();
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("Responsible organisation: TEST ORG");
        expect(page.lookupHeaderEmailLink.get(0).getAttribute("href")).toContain("?source=ripe&key=ORG-TEST1-RIPE&type=organisation");
        expect(page.lookupHeaderQueryPage.getText()).toContain("Abuse contact info: abuse-c@test.net");
        expect(page.lookupHeaderEmailLink.get(1).getAttribute("href")).toContain("?source=ripe&key=ABUSE-C-RIPE&type=role");
        expect(page.lookupHeaderQueryPage.getText()).toContain("Abuse-mailbox validation failed. Please refer to ORG-TEST2-RIPE for further information.");
        expect(page.lookupHeaderEmailLink.get(2).getAttribute("href")).toContain("?source=ripe&key=ORG-TEST2-RIPE&type=organisation");
    });

    it("should show checkbox - Highlight RIPE NCC managed values", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.ripeManagedAttributesLabel);
        expect(page.ripeManagedAttributesLabel.getText()).toContain("Highlight RIPE NCC managed values");
        // unselect
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(false);
        // select
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(true);

    });

    it("should be able to show out of region route from ripe db", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
        const nonRipeWhoisObject = page.getWhoisObjectViewerOnQueryPage(2);
        expect(nonRipeWhoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
    });

    it("should be able to show out of region route from ripe db without related objects", () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpShowFullDetails.click();
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:17"));
        page.byId("search:types:17").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute("href")).toEqual("https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb");
    });

    it("should contain ripe-nonauth for source in link on attribute value", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(2, 0).getAttribute("href")).toContain("?source=ripe-nonauth&key=211.43.192.0%2F19AS9777&type=route");
    });

    it("should contain date in proper format", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 5).getText()).toContain("1970-01-01T00:00:00Z");
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 6).getText()).toContain("2018-07-23T13:00:20Z");
    });

    it("should be able to show out of region route from ripe db without related objects", () => {
        page.inpQueryString.sendKeys("AS9777");
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpShowFullDetails.click();
        page.scrollIntoView(page.queryParamTabs.get(1));
        page.queryParamTabs.get(1).click();
        page.scrollIntoView(page.byId("search:types:2"));
        page.byId("search:types:2").click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 0).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS9777&type=aut-num");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 9).getAttribute("href")).toContain("?source=ripe-nonauth&key=JYH3-RIPE&type=person");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 10).getAttribute("href")).toContain("?source=ripe-nonauth&key=SDH19-RIPE&type=person");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 18).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner");
        expect(page.inpQueryString.getAttribute("value")).toEqual("AS9777");
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute("href")).toEqual("https://stat.ripe.net/AS9777?sourceapp=ripedb");
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 21).getText()).toEqual("RIPE-NONAUTH");
        // XML
        expect(page.lookupLinkToXmlJSON.get(1).getAttribute("href")).toContain(".xml?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE");
        // JSON
        expect(page.lookupLinkToXmlJSON.get(2).getAttribute("href")).toContain(".json?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE");
    });

    it("should show version of whois after searching", () => {
        page.scrollIntoView(page.whoisVersionTag);
        expect(page.whoisVersionTag.isDisplayed()).toBeFalsy();
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.whoisVersion);
        expect(page.whoisVersionTag.isDisplayed()).toBeTruthy();
        expect(page.whoisVersion.isDisplayed()).toBeTruthy();
        expect(page.whoisVersion.getText()).toEqual("RIPE Database Software Version 1.97-SNAPSHOT");
    });

    // TEMPLATE QUERY -t or --template
    it("should be able to search --template using the text box", () => {
        page.inpQueryString.sendKeys("-t person\n");
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.templateSearchResults);
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t person");
        expect(page.inpTelnetQuery.getText()).toEqual("-t person");
        expect(page.templateSearchResults.getText()).toEqual(
            "person:         [mandatory]  [single]     [lookup key]\n" +
            "address:        [mandatory]  [multiple]   [ ]\n" +
            "phone:          [mandatory]  [multiple]   [ ]\n" +
            "fax-no:         [optional]   [multiple]   [ ]\n" +
            "e-mail:         [optional]   [multiple]   [lookup key]\n" +
            "org:            [optional]   [multiple]   [inverse key]\n" +
            "nic-hdl:        [mandatory]  [single]     [primary/lookup key]\n" +
            "remarks:        [optional]   [multiple]   [ ]\n" +
            "notify:         [optional]   [multiple]   [inverse key]\n" +
            "mnt-by:         [mandatory]  [multiple]   [inverse key]\n" +
            "created:        [generated]  [single]     [ ]\n" +
            "last-modified:  [generated]  [single]     [ ]\n" +
            "source:         [mandatory]  [single]     [ ]");
    });

    it("should not show template panel in case of error query", () => {
        page.inpQueryString.sendKeys("something -t notExistingObjectType inet6num\n");
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.templateSearchResults.isPresent()).toBeFalsy();
        expect(page.inpTelnetQuery.getText()).toEqual(" ");
    });

    it("should be able to search --verbose using the text box", () => {
        page.inpQueryString.sendKeys("-t aut-num\n");
        page.btnSubmitQuery.click();
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t aut-num");
        expect(page.inpTelnetQuery.getText()).toEqual("-t aut-num");
        expect(page.templateSearchResults.getText()).toContain("The aut-num class:");
        expect(page.templateSearchResults.getText()).toContain("An object of the aut-num class is a database representation of");
        expect(page.templateSearchResults.getText()).toContain("A descriptive name associated with an AS.");
        expect(page.templateSearchResults.getText()).toContain("any as-any rs-any peeras and or not atomic from to at");
        expect(page.templateSearchResults.getText()).toContain("registry name must be a letter or a digit.");
    });

    it("should hide template search result after new query is triggered", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("-t aut-num\n");
        // page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // page.scrollIntoView(page.templateSearchResults);
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t aut-num");
        expect(page.inpTelnetQuery.getText()).toEqual("-t aut-num");
        expect(page.templateSearchResults.isDisplayed()).toEqual(true);
        expect(page.resultsSection.isDisplayed()).toEqual(false);
        page.inpQueryString.clear();
        page.inpQueryString.sendKeys("211.43.192.0");
        page.scrollIntoView(page.inpShowFullDetails);
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        // page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.templateSearchResults.isPresent()).toEqual(false);
        expect(page.resultsSection.isDisplayed()).toEqual(true);
    });

    //--resource in query
    it("should be able to search --resource (source=GRS) using the text box", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.inpQueryString.sendKeys("1.1.1.1 --resource\n");
        page.btnSubmitQuery.click();
        expect(page.inpTelnetQuery.getText()).toEqual("-B --resource 1.1.1.1");
        expect(page.searchResults.count()).toEqual(3);
    });
});
