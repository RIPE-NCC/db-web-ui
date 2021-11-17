import {browser} from "protractor";
import {waitToBeClickable} from "./fixtures";

const page = require("./homePageObject");

describe("The query pagina", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "query");
        page.disableLiveChat();
    });

    it("should have all its bits on the screen somewhere", async () => {
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        page.advanceFilterMenu.click();
        expect(page.inpDontRetrieveRelatedInput.isSelected()).toBeTruthy();
        expect(page.inpShowFullDetailsInput.isSelected()).toBeFalsy();
        await page.clickOnOverlayBackdrop();

        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click(); // nothing should happen, everything is ok
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        page.advanceFilterMenu.click();
        expect(page.inpDontRetrieveRelatedInput.isSelected()).toBeTruthy();
        expect(page.inpShowFullDetailsInput.isSelected()).toBeFalsy();
    });

    it("should be able to search using the text box", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0"); // press "enter" for a laugh
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.scrollIntoView(page.resultsSection);
        expect(page.searchResults.count()).toEqual(4);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
    });

    it("should be able to search using the text box and a type checkbox", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        page.scrollIntoView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        page.scrollIntoView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
        expect(browser.getCurrentUrl()).toContain("193.0.0.0");
        expect(browser.getCurrentUrl()).toContain("types=inetnum");
    });

    it("should be able to have source dynamic", async () => {
        page.inpQueryString.sendKeys("193.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        page.scrollIntoView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should be able to have source dynamic", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        page.scrollIntoView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should search by inverse lookup abuse-c", async () => {
        page.inpQueryString.sendKeys("ACRO862-RIPE");
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter (1)");
        expect(page.typeMenu.getText()).toEqual("Types");
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-12"));
        page.scrollIntoView(page.byId("mat-checkbox-12")); // organisation
        page.byId("mat-checkbox-12").click();
        await page.clickOnOverlayBackdrop();
        expect(page.typeMenu.getText()).toEqual("Types (1)");
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup");
        page.inverseLookupMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-23"));
        page.scrollIntoView(page.byId("mat-checkbox-23")); // organisation
        page.byId("mat-checkbox-23").click();
        await page.clickOnOverlayBackdrop();
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup (1)");
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        const whoisObject = page.getWhoisObjectViewerOnQueryPage(0);
        expect(whoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 1).getText()).toEqual("Aloses Telekom Hizm. San. ve Tic. Ltd. Sti.");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeFalsy();
    });

    it("should count not default values as selected items in advance filter dropdown", async () => {
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter (1)");
        page.advanceFilterMenu.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter (2)");
    });

    it("should have selected No hierarchy flag by default on hierarchy tab", () => {
        page.scrollIntoView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        // click on Hierarchy flags tab
        page.hierarchyFlagsMenu.click();
        expect(page.hierarchyFlag.isDisplayed()).toBeTruthy();
        expect(page.hierarchyFlagSlider.getAttribute("aria-valuenow")).toEqual("0");
        expect(page.hierarchyFlagDescription.getText()).toBeTruthy("No hierarchy flag (default).");
        expect(page.hierarchyDCheckBoxInput.isEnabled()).toBeTruthy();
    });

    it("should not uncheck domain flag when hierarchial flag is unselected", async () => {
        // firefox webdriver doesn't support drag and drop
        if ((await browser.getCapabilities()).get('browserName').toLowerCase() === 'firefox') {
            return;
        }
        // click on Hierarchy flags tab
        page.scrollIntoView(page.hierarchyFlagsMenu);
        page.hierarchyFlagsMenu.click();
        await waitToBeClickable(page.hierarchyFlag);
        expect(page.hierarchyFlag.isDisplayed()).toBeTruthy();
        expect(page.hierarchyFlagSlider.getAttribute("aria-valuenow")).toEqual("0");
        // move slider to x
        await browser.actions().dragAndDrop(
            page.hierarchyFlagSlider,
            {x:500, y:0}
        ).perform();
        expect(page.hierarchyFlagSlider.getAttribute("aria-valuenow")).toEqual("5");
        expect(page.hierarchyDCheckBoxInput.isEnabled()).toBeTruthy();
        page.scrollIntoView(page.hierarchyDCheckBoxInput);
        page.hierarchyDCheckBox.click();
        expect(page.hierarchyDCheckBoxInput.isSelected()).toBeTruthy();
        // move slider to x
        await browser.actions().dragAndDrop(
            page.hierarchyFlagSlider,
            {x:3, y:0}
        ).perform();
        expect(page.hierarchyDCheckBox.isSelected()).toBeFalsy();
        expect(page.hierarchyDCheckBoxInput.isEnabled()).toBeTruthy();
        await page.clickOnOverlayBackdrop();
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags (2)");
    });

    it("should be specified ripe stat link", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
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

    it("should show object banner with text - No abuse contact found", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("No abuse contact found");
    });

    it("should show object banner with abuse contact info", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("Responsible organisation: WITBE NET S.A.");
        expect(page.lookupHeaderEmailLink.get(0).getAttribute("href")).toContain("?source=ripe&key=ORG-WA9-RIPE&type=organisation");
        expect(page.lookupHeaderQueryPage.getText()).toContain("Abuse contact info: lir@witbe.net");
        expect(page.lookupHeaderEmailLink.get(1).getAttribute("href")).toContain("?source=ripe&key=AR15400-RIPE&type=role");
    });

    it("should show object banner with suspected abuse contact info", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        // -- just to use same mock
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        page.scrollIntoView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
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

    it("should show checkbox - Highlight RIPE NCC managed values", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
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

    it("should be able to show out of region route from ripe db", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
        const nonRipeWhoisObject = page.getWhoisObjectViewerOnQueryPage(2);
        expect(nonRipeWhoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
    });

    it("should be able to show out of region route from ripe db without related objects", async () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-18"));
        page.scrollIntoView(page.byId("mat-checkbox-18"));
        page.byId("mat-checkbox-18").click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute("href")).toEqual("https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb");
    });

    it("should contain ripe-nonauth for source in link on attribute value", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(2, 0).getAttribute("href")).toContain("?source=ripe-nonauth&key=211.43.192.0%2F19AS9777&type=route");
    });

    it("should contain date in proper format", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.scrollIntoView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 5).getText()).toContain("1970-01-01T00:00:00Z");
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 6).getText()).toContain("2018-07-23T13:00:20Z");
    });

    it("should be able to show out of region route from ripe db without related objects", async () => {
        page.inpQueryString.sendKeys("AS9777");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-3"));
        page.scrollIntoView(page.byId("mat-checkbox-3"));
        page.byId("mat-checkbox-3").click();
        await page.clickOnOverlayBackdrop();
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

    it("should show version of whois after searching", async () => {
        page.scrollIntoView(page.whoisVersionTag);
        expect(page.whoisVersionTag.isDisplayed()).toBeFalsy();
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
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
        // expect(page.inpTelnetQuery.getText()).toEqual("-t person");
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
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
    });

    it("should be able to search --template using the text box", () => {
        page.inpQueryString.sendKeys("-t aut-num");
        page.btnSubmitQuery.click();
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t aut-num");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
        expect(page.templateSearchResults.getText()).toContain("The aut-num class:");
        expect(page.templateSearchResults.getText()).toContain("An object of the aut-num class is a database representation of");
        expect(page.templateSearchResults.getText()).toContain("A descriptive name associated with an AS.");
        expect(page.templateSearchResults.getText()).toContain("any as-any rs-any peeras and or not atomic from to at");
        expect(page.templateSearchResults.getText()).toContain("registry name must be a letter or a digit.");
    });

    it("should hide template search result after new query is triggered", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.sendKeys("-t aut-num");
        page.btnSubmitQuery.click();
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t aut-num");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
        page.scrollIntoView(page.templateSearchResults);
        expect(page.templateSearchResults.isDisplayed()).toBeTruthy();
        expect(page.resultsSection.isDisplayed()).toBeFalsy();
        page.inpQueryString.clear().sendKeys("211.43.192.0");
        page.scrollIntoView(page.certificateBanner);
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.btnSubmitQuery.click();
        expect(page.templateSearchResults.isPresent()).toBeFalsy();
        // doesn't work in ff but cannot be reproduced manually
        // expect(page.resultsSection.isDisplayed()).toBeTruthy();
    });

    //--resource in query
    it("should be able to search --resource (source=GRS) using the text box", async () => {
        page.scrollIntoView(page.inpQueryString);
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.inpQueryString.clear().sendKeys("1.1.1.1 --resource");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toEqual(true);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
    });

    //query-flags-container
    it("should show query-flags-container and disable rest of search form", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.clear().sendKeys("-i abuse-c -T organisation -Br --sources RIPE ANNA");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
        expect(page.typeMenu.isPresent()).toBeFalsy();
        expect(page.hierarchyFlagsMenu.isPresent()).toBeFalsy();
        expect(page.inverseLookupMenu.isPresent()).toBeFalsy();
        expect(page.advanceFilterMenu.isPresent()).toBeFalsy();
    });

    it("should show query-flags-container with adequate flags", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.clear().sendKeys("-i abuse-c -T organisation -Br --sources RIPE ANNA");
        const allExpectFlags = ["-i", "--inverse",
            "-T", "--select-types",
            "-B", "--no-filtering",
            "-r", "--no-referenced",
            "-s", "--sources"];
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(0).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(1).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(2).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(3).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(4).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(5).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(6).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(7).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(8).getText());
        expect(allExpectFlags).toContain(page.inpQueryFlags.get(9).getText());
    });

    it("should show error banner when flag is invalid and valid flag in query flag container", () => {
        page.scrollIntoView(page.inpQueryString);
        page.inpQueryString.clear().sendKeys("-z --sources RIPE ANNA");
        expect(page.inpQueryFlags.get(0).getText()).toContain("-s");
        expect(page.inpQueryFlags.get(1).getText()).toContain("--sources");
        page.btnSubmitQuery.click();
        expect(page.errorAlert.isPresent()).toEqual(true);
        expect(page.errorAlert.getText()).toEqual("ERROR:111: invalid option supplied. Use help query to see the valid options.");
    });

});
