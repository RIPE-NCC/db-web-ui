import {browser, protractor} from "protractor";
import {waitToBeClickable} from "./fixtures";

const page = require("./homePageObject");

describe("The query page", () => {

    beforeEach(async () => {
        await page.navigateTo(browser.baseUrl + "query");
        await page.removeCookiesBanner();
        await page.disableLiveChat();
    });

    it("should have all its bits on the screen somewhere", async () => {
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        expect(page.advanceFilterMenu.isPresent()).toBeFalsy();
        page.btnSubmitQuery.click(); // nothing should happen, everything is ok
        expect(page.inpQueryString.getAttribute("value")).toEqual("");
        expect(page.advanceFilterMenu.isPresent()).toBeFalsy();
        page.inpQueryString.sendKeys("193.0.0.0");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.advanceFilterMenu.isPresent()).toBeTruthy();
        page.advanceFilterMenu.click();
        expect(page.inpDontRetrieveRelatedInput.isSelected()).toBeTruthy();
        expect(page.inpShowFullDetailsInput.isSelected()).toBeFalsy();
    });

    it("should be able to search using the text box", async () => {
        // first execute the search
        page.inpQueryString.sendKeys("193.0.0.0"); // press "enter" for a laugh
        page.btnSubmitQuery.click();
        // then refine the result after displaying the menu
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.resultsSection);
        expect(page.searchResults.count()).toEqual(4);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
    });

    it("should be able to search using the text box and a type checkbox", async () => {
        page.inpQueryString.sendKeys("193.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.scrollIntoCenteredView(page.inpDontRetrieveRelated);
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.inpQueryString.getAttribute("value")).toEqual("193.0.0.0");
        expect(browser.getCurrentUrl()).toContain("193.0.0.0");
        expect(browser.getCurrentUrl()).toContain("types=inetnum");
    });

    it("should be able to have source dynamic", async () => {
        page.inpQueryString.sendKeys("193.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should be able to have source dynamic", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.resultsSection.getAttribute("innerHTML")).toContain("?source=ripe&amp;key=ORG-IANA1-RIPE&amp;type=organisation");
    });

    it("should search by inverse lookup abuse-c", async () => {
        page.inpQueryString.sendKeys("AR24917-RIPE");
        page.btnSubmitQuery.click();
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter");
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter (1)");
        expect(page.typeMenu.getText()).toEqual("Types");
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-12"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-12")); // organisation
        page.byId("mat-checkbox-12").click();
        await page.clickOnOverlayBackdrop();
        expect(page.typeMenu.getText()).toEqual("Types (1)");
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup");
        page.inverseLookupMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-23"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-23")); // organisation
        page.byId("mat-checkbox-23").click();
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup (1)");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        const whoisObject = page.getWhoisObjectViewerOnQueryPage(0);
        expect(whoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 1).getText()).toEqual("Metropolitan Networks UK Ltd");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeFalsy();
    });

    it("should not count default values as selected items in advance filter dropdown", async () => {
        page.inpQueryString.sendKeys("AR24917-RIPE");
        page.btnSubmitQuery.click();
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

    it("should have disabled hierarchy tab - when search term is recognised like type from ObjectTypesEnum and is not inetnum, inet6num, domain, route, route6", () => {
        page.inpQueryString.sendKeys("AR24917-RIPE");
        page.btnSubmitQuery.click();
        page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        // click on Hierarchy flags tab
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeFalsy();
    });

    it("should have enabled hierarchy tab when search term is not recognised as type inetnum, inet6num, domain, route or route6, organisation, person/role or maintainer", () => {
        page.inpQueryString.sendKeys("223.0.0.0 something");
        page.btnSubmitQuery.click();
        page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeTruthy();
    });

    it("should have enabled all checkbox in Types dropdown and Inverse Lookup when search term is not recognised as type inetnum, inet6num, domain, route or route6, organisation, person/role or maintainer", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 something");
        page.btnSubmitQuery.click();
        page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeTruthy();
        // checkboxs in Types dropdown
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-1"));
        page.scrollIntoCenteredView(page.byId("mat-checkbox-1"));
        expect(page.byId("mat-checkbox-1").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-2").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-3").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-4").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-5").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-6").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-7").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-8").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-9").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-10").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-11").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-12").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-13").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-14").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-15").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-16").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-17").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-18").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-19").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-20").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-21").isEnabled()).toBeTruthy();
        await page.clickOnOverlayBackdrop();
        // checkboxs in Inverse Lookup dropdown
        page.inverseLookupMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-23"));
        expect(page.byId("mat-checkbox-23").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-24").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-25").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-26").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-27").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-28").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-29").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-30").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-31").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-32").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-33").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-34").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-35").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-36").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-37").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-38").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-39").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-40").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-41").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-42").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-43").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-44").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-45").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-46").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-47").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-48").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-49").isEnabled()).toBeTruthy();
        expect(page.byId("mat-checkbox-50").isEnabled()).toBeTruthy();
    });

    it("should have enabled just person/role, role and organisation checkbox in Types dropdown when type is person", async () => {
        page.inpQueryString.sendKeys("AR24917-RIPE");
        page.btnSubmitQuery.click();
        page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeFalsy();
        // checkbox in Types dropdown
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-12"));
        page.scrollIntoCenteredView(page.byId("mat-checkbox-12"));
        expect(page.byCss("#mat-checkbox-1 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-2 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-3 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-4 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-5 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-6 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-7 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-8 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-9 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-10 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-11 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-12").isEnabled()).toBeTruthy(); // organisation
        expect(page.byCss("#mat-checkbox-13 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-14").isEnabled()).toBeTruthy(); // person
        expect(page.byCss("#mat-checkbox-15 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-16 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-17").isEnabled()).toBeTruthy(); // role
        expect(page.byCss("#mat-checkbox-18 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-19 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-20 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-21 input").getAttribute("disabled")).toBeTruthy();
        await page.clickOnOverlayBackdrop();
        // checkboxs in Inverse Lookup dropdown
        page.inverseLookupMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-23"));
        expect(page.byId("mat-checkbox-23").isEnabled()).toBeTruthy(); // abuse-c
        expect(page.byId("mat-checkbox-24").isEnabled()).toBeTruthy(); //abuse-mailbox
        expect(page.byId("mat-checkbox-25").isEnabled()).toBeTruthy(); //admin-c
        expect(page.byCss("#mat-checkbox-26 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-27 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-28 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-29 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-30 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-31 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-32 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-33 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-34").isEnabled()).toBeTruthy(); // mnt-by
        expect(page.byCss("#mat-checkbox-35 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-36 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-37 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-38 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-39").isEnabled()).toBeTruthy(); //mnt-ref
        expect(page.byCss("#mat-checkbox-40 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-41").isEnabled()).toBeTruthy(); // notify
        expect(page.byCss("#mat-checkbox-42 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-43").isEnabled()).toBeTruthy(); // org
        expect(page.byCss("#mat-checkbox-44 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-45").isEnabled()).toBeTruthy(); // person
        expect(page.byCss("#mat-checkbox-46 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-47").isEnabled()).toBeTruthy(); //ref-nfy
        expect(page.byId("mat-checkbox-48").isEnabled()).toBeTruthy(); //tech-c
        expect(page.byCss("#mat-checkbox-49 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-50 input").getAttribute("disabled")).toBeTruthy();
    });

    it("should have enabled just inetnum, route and domain checkbox in Types dropdown when type is inetnum", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.btnSubmitQuery.click();
        page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeTruthy();
        // checkbox in Types dropdown
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-4"));
        page.scrollIntoCenteredView(page.byId("mat-checkbox-4"));
        expect(page.byCss("#mat-checkbox-1 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-2 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-3 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-4").isEnabled()).toBeTruthy(); // domain
        expect(page.byCss("#mat-checkbox-5 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-6 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-7").isEnabled()).toBeTruthy(); // inetnum
        expect(page.byCss("#mat-checkbox-8 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-9 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-10 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-11 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-12 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-13 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-14 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-15 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-16 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-17 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-18").isEnabled()).toBeTruthy(); // route
        expect(page.byCss("#mat-checkbox-19 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-20 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-21 input").getAttribute("disabled")).toBeTruthy();
        await page.clickOnOverlayBackdrop();
        // checkboxs in Inverse Lookup dropdown
        page.inverseLookupMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-23"));
        page.scrollIntoCenteredView(page.byId("mat-checkbox-23"));
        expect(page.byId("mat-checkbox-23").isEnabled()).toBeTruthy(); // abuse-c
        expect(page.byCss("#mat-checkbox-24 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-25").isEnabled()).toBeTruthy(); // admin-c
        expect(page.byCss("#mat-checkbox-26 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-27 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-28 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-29 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-30 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-31 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-32 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-33").isEnabled()).toBeTruthy(); // member-of
        expect(page.byId("mat-checkbox-34").isEnabled()).toBeTruthy(); // mnt-by
        expect(page.byId("mat-checkbox-35").isEnabled()).toBeTruthy(); // mnt-domain
        expect(page.byId("mat-checkbox-36").isEnabled()).toBeTruthy(); // mnt-irt
        expect(page.byId("mat-checkbox-37").isEnabled()).toBeTruthy(); // mnt-lower
        expect(page.byCss("#mat-checkbox-38 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-39 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-40").isEnabled()).toBeTruthy(); // mnt-routes
        expect(page.byId("mat-checkbox-41").isEnabled()).toBeTruthy(); // notify
        expect(page.byId("mat-checkbox-42").isEnabled()).toBeTruthy(); // nserver
        expect(page.byId("mat-checkbox-43").isEnabled()).toBeTruthy(); // org
        expect(page.byId("mat-checkbox-44").isEnabled()).toBeTruthy(); // origin
        expect(page.byCss("#mat-checkbox-45 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-46").isEnabled()).toBeTruthy(); // ping-hdl
        expect(page.byCss("#mat-checkbox-47 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-48").isEnabled()).toBeTruthy(); //tech-c
        expect(page.byCss("#mat-checkbox-49 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byId("mat-checkbox-50").isEnabled()).toBeTruthy(); // zone-c
    });

    it("should have selected No hierarchy flag by default on hierarchy tab", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
        expect(page.hierarchyFlagsMenu.getText()).toEqual("Hierarchy flags");
        // should have enabled hierarchy tab - when search term is recognised like type inetnum, inet6num, domain, route or route6
        expect(page.hierarchyFlagsMenu.isEnabled()).toBeTruthy();
        // click on Hierarchy flags tab
        page.hierarchyFlagsMenu.click();
        expect(page.hierarchyFlag.isDisplayed()).toBeTruthy();
        expect(page.hierarchyFlagSlider.getAttribute("aria-valuenow")).toEqual("0");
        expect(page.hierarchyFlagDescription.getText()).toBeTruthy("No hierarchy flag (default).");
        expect(page.hierarchyDCheckBoxInput.isEnabled()).toBeTruthy();
    });

    it("should not uncheck domain flag when hierarchical flag is unselected", async () => {
        // firefox webdriver doesn't support drag and drop
        if ((await browser.getCapabilities()).get('browserName').toLowerCase() === 'firefox') {
            return;
        }
        page.inpQueryString.sendKeys("223.0.0.0");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // click on Hierarchy flags tab
        await page.scrollIntoCenteredView(page.hierarchyFlagsMenu);
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
        await page.scrollIntoCenteredView(page.hierarchyDCheckBoxInput);
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

    it("should reset all dropdowns checkboxes to default on click Reset filters button", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 all");
        page.btnSubmitQuery.click();
        page.typeMenu.click();
        page.byCss("#mat-checkbox-1").click();
        page.byCss("#mat-checkbox-4").click();
        page.byCss("#mat-checkbox-19").click();
        await page.clickOnOverlayBackdrop();
        page.inverseLookupMenu.click();
        page.byCss("#mat-checkbox-30").click();
        page.byCss("#mat-checkbox-36").click();
        await page.clickOnOverlayBackdrop();
        page.advanceFilterMenu.click();
        page.byCss("#showFullObjectDetails").click();
        await page.clickOnOverlayBackdrop();
        expect(page.typeMenu.getText()).toEqual("Types (3)");
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup (2)");
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter (1)");
        page.btnResetFilters.click();
        page.typeMenu.click();
        expect(page.byCss("#mat-checkbox-1 input").isSelected()).toBeFalsy();
        expect(page.byCss("#mat-checkbox-4 input").isSelected()).toBeFalsy();
        expect(page.byCss("#mat-checkbox-19 input").isSelected()).toBeFalsy();
        await page.clickOnOverlayBackdrop();
        page.inverseLookupMenu.click();
        expect(page.byCss("#mat-checkbox-30 input").isSelected()).toBeFalsy();
        expect(page.byCss("#mat-checkbox-36 input").isSelected()).toBeFalsy();
        await page.clickOnOverlayBackdrop();
        page.advanceFilterMenu.click();
        expect(page.byCss("#showFullObjectDetails").isSelected()).toBeFalsy();
        expect(page.typeMenu.getText()).toEqual("Types");
        expect(page.inverseLookupMenu.getText()).toEqual("Inverse lookup");
        expect(page.advanceFilterMenu.getText()).toEqual("Advance filter");
    });

    it("should disable Apply Filters and Reset filters if there is no selected checkboxes in filters dropdowns", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 all");
        page.btnSubmitQuery.click();
        expect(page.btnApplyFilters.isEnabled()).toBeFalsy();
        expect(page.btnResetFilters.getAttribute("disabled")).toBeTruthy();
        page.typeMenu.click();
        page.byCss("#mat-checkbox-1").click();
        page.byCss("#mat-checkbox-10").click();
        await page.clickOnOverlayBackdrop();
        expect(page.btnApplyFilters.isEnabled()).toBeTruthy();
        expect(page.btnResetFilters.getAttribute("disabled")).toBeFalsy();
        page.btnResetFilters.click();
        expect(page.btnApplyFilters.isEnabled()).toBeFalsy();
        expect(page.btnResetFilters.getAttribute("disabled")).toBeTruthy();
    });

    it("should uncheck checkbox if it become disabled after search", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 all");
        page.btnSubmitQuery.click();
        expect(page.noResultsMsgPanel.isDisplayed()).toBeTruthy();
        expect(page.noResultsMsgPanel.getText()).toEqual("No results found, try changing the search term or filters");
        page.typeMenu.click();
        page.byCss("#mat-checkbox-1").click();
        page.byCss("#mat-checkbox-4").click();
        page.inpQueryString.clear();
        page.inpQueryString.sendKeys("223.0.0.0");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnApplyFilters);
        page.btnApplyFilters.click();
        page.typeMenu.click();
        expect(page.byCss("#mat-checkbox-1 input").getAttribute("disabled")).toBeTruthy();
        expect(page.byCss("#mat-checkbox-1 input").isSelected()).toBeFalsy();//should be unchecked
        expect(page.byCss("#mat-checkbox-4 input").isSelected()).toBeTruthy();
        expect(page.byCss("#mat-checkbox-4 input").isEnabled()).toBeTruthy();
    });

    it("should have share button disable if there is no results", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 all");
        page.btnSubmitQuery.click();
        expect(page.btnShare.isEnabled()).toBeFalsy();
    });

    it("should have share button enabled if there is results", async () => {
        page.inpQueryString.sendKeys("AS9777");
        page.btnSubmitQuery.click();
        expect(page.btnShare.isEnabled()).toBeTruthy();
    });

    it("should contain perm, xml and json links in Share Panel", async () => {
        // firefox webdriver doesn't support browser.actions().sendKeys
        if ((await browser.getCapabilities()).get('browserName').toLowerCase() === 'firefox') {
            return;
        }
        page.inpQueryString.sendKeys("AS9777");
        page.btnSubmitQuery.click();
        page.btnShare.click();
        //COPY URL
        expect(page.permLink.getAttribute("value")).toContain("/db-web-ui/query?searchtext=AS9777&rflag=true&source=RIPE&bflag=false");
        page.btnCopyPermLink.click();
        page.inpQueryString.click();
        // paste for local mac
        await browser.actions().sendKeys(protractor.Key.COMMAND, 'v').perform();
        // paste for CI
        await browser.actions().sendKeys(protractor.Key.CONTROL, 'v').perform();
        expect(page.inpQueryString.getAttribute("value")).toContain("/db-web-ui/query?searchtext=AS9777&rflag=true&source=RIPE&bflag=false");
        page.inpQueryString.clear().sendKeys("AS9777");
        // XML
        expect(page.linksToXmlJSON.get(0).getAttribute("href")).toContain(".xml?query-string=AS9777&flags=no-referenced&flags=no-irt&source=RIPE");
        // JSON
        expect(page.linksToXmlJSON.get(0).getAttribute("href")).toContain(".xml?query-string=AS9777&flags=no-referenced&flags=no-irt&source=RIPE");
    });

    it("should be specified ripe stat link", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        const ripeStateButtonInetnum = page.getRipeStateFromWhoisObjectOnQueryPage(0);
        await page.scrollIntoCenteredView(ripeStateButtonInetnum);
        expect(ripeStateButtonInetnum.isPresent()).toEqual(true);
        const urlInet = ripeStateButtonInetnum.getAttribute("href");
        expect(urlInet).toEqual("https://stat.ripe.net/193.0.0.0%20-%20193.0.0.63?sourceapp=ripedb");
        // link for route(6) should contain just route value without AS
        const ripeStateButtonRoute = page.getRipeStateFromWhoisObjectOnQueryPage(3);
        await page.scrollIntoCenteredView(ripeStateButtonRoute);
        expect(ripeStateButtonRoute.isPresent()).toEqual(true);
        const urlRoute = ripeStateButtonRoute.getAttribute("href");
        expect(urlRoute).toEqual("https://stat.ripe.net/193.0.0.0/21?sourceapp=ripedb");
    });

    it("shouldn't show banner with ERORR:101 but 'No results..' message in panel", async () => {
        page.inpQueryString.sendKeys("223.0.0.0 all");
        page.btnSubmitQuery.click();
        expect(page.noResultsMsgPanel.getText()).toEqual("No results found, try changing the search term or filters");
        expect(page.errorMessage.isPresent()).toEqual(false); //banner is not shown
    });

    it("should show object banner with text - No abuse contact found", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        // ripe stat link for should contain inetnum
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("No abuse contact found");
    });

    it("should show object banner with abuse contact info", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.lookupHeaderQueryPage.isPresent()).toEqual(true);
        expect(page.lookupHeaderQueryPage.getText()).toContain("Responsible organisation: WITBE NET S.A.");
        expect(page.lookupHeaderEmailLink.get(0).getAttribute("href")).toContain("?source=ripe&key=ORG-WA9-RIPE&type=organisation");
        expect(page.lookupHeaderQueryPage.getText()).toContain("Abuse contact info: lir@witbe.net");
        expect(page.lookupHeaderEmailLink.get(1).getAttribute("href")).toContain("?source=ripe&key=AR15400-RIPE&type=role");
    });

    it("should show object banner with suspected abuse contact info", async () => {
        page.inpQueryString.sendKeys("223.0.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        // -- just to use same mock
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-7"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-7"));
        page.byId("mat-checkbox-7").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
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
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("193.201.0.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.ripeManagedAttributesLabel);
        expect(page.ripeManagedAttributesLabel.getText()).toContain("Highlight RIPE NCC managed values");
        // unselect
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(false);
        // select
        page.ripeManagedAttributesCheckbox.click();
        expect(page.showRipeManagedAttrSelected.isPresent()).toEqual(true);

    });

    it("should be able to show out of region route from ripe db", async () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
        const nonRipeWhoisObject = page.getWhoisObjectViewerOnQueryPage(2);
        expect(nonRipeWhoisObject.isPresent()).toEqual(true);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
    });

    it("should be able to show out of region route from ripe db without related objects", async () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-18"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-18"));
        page.byId("mat-checkbox-18").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 7).getText()).toEqual("RIPE-NONAUTH");
        expect(page.inpQueryString.getAttribute("value")).toEqual("211.43.192.0");
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute("href")).toEqual("https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb");
    });

    it("should contain ripe-nonauth for source in link on attribute value", async () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(2, 0).getAttribute("href")).toContain("?source=ripe-nonauth&key=211.43.192.0%2F19AS9777&type=route");
    });

    it("should contain date in proper format", async () => {
        page.inpQueryString.sendKeys("211.43.192.0");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 5).getText()).toContain("1970-01-01T00:00:00Z");
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(2, 6).getText()).toContain("2018-07-23T13:00:20Z");
    });

    it("should be able to show out of region route from ripe db without related objects", async () => {
        page.inpQueryString.sendKeys("AS9777");
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        await page.clickOnOverlayBackdrop();
        page.typeMenu.click();
        await waitToBeClickable(page.byId("mat-checkbox-3"));
        await page.scrollIntoCenteredView(page.byId("mat-checkbox-3"));
        page.byId("mat-checkbox-3").click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(1);
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 0).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS9777&type=aut-num");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 9).getAttribute("href")).toContain("?source=ripe-nonauth&key=JYH3-RIPE&type=person");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 10).getAttribute("href")).toContain("?source=ripe-nonauth&key=SDH19-RIPE&type=person");
        expect(page.getAttributeHrefFromWhoisObjectOnQueryPage(0, 18).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner");
        expect(page.inpQueryString.getAttribute("value")).toEqual("AS9777");
        expect(page.getRipeStateFromWhoisObjectOnQueryPage(0).getAttribute("href")).toEqual("https://stat.ripe.net/AS9777?sourceapp=ripedb");
        expect(page.getAttributeValueFromWhoisObjectOnQueryPage(0, 21).getText()).toEqual("RIPE-NONAUTH");
        page.btnShare.click();
        // XML
        expect(page.linksToXmlJSON.get(0).getAttribute("href")).toContain(".xml?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE");
        // JSON
        expect(page.linksToXmlJSON.get(1).getAttribute("href")).toContain(".json?query-string=AS9777&type-filter=aut-num&flags=no-referenced&flags=no-irt&flags=no-filtering&source=RIPE");
    });

    it("should show version of whois after searching", async () => {
        await page.scrollIntoCenteredView(page.whoisVersionTag);
        expect(page.whoisVersionTag.isDisplayed()).toBeFalsy();
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("211.43.192.0");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.whoisVersion);
        expect(page.whoisVersionTag.isDisplayed()).toBeTruthy();
        expect(page.whoisVersion.isDisplayed()).toBeTruthy();
        expect(page.whoisVersion.getText()).toEqual("RIPE Database Software Version 1.97-SNAPSHOT");
    });

    // TEMPLATE QUERY -t or --template
    it("should be able to search --template using the text box", async () => {
        page.inpQueryString.sendKeys("-t person\n");
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.templateSearchResults);
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

    it("should not show template panel in case of error query", async () => {
        page.inpQueryString.sendKeys("something -t notExistingObjectType inet6num\n");
        await page.scrollIntoCenteredView(page.btnSubmitQuery)
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
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.sendKeys("-t aut-num");
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.inpQueryString.getAttribute("value")).toEqual("-t aut-num");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
        expect(page.templateSearchResults.isDisplayed()).toBeTruthy();
        expect(page.resultsSection.isDisplayed()).toBeFalsy();
        page.inpQueryString.clear().sendKeys("211.43.192.0");
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        await page.scrollIntoCenteredView(page.certificateBanner);
        page.advanceFilterMenu.click();
        page.inpShowFullDetails.click();
        page.inpDontRetrieveRelated.click();
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.templateSearchResults.isPresent()).toBeFalsy();
        // doesn't work in ff but cannot be reproduced manually
        // expect(page.resultsSection.isDisplayed()).toBeTruthy();
    });

    //--resource in query
    it("should be able to search --resource (source=GRS) using the text box", async () => {
        page.inpQueryString.sendKeys("1.1.1.1 --resource");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toEqual(true);
        await page.clickOnOverlayBackdrop();
        await page.scrollIntoCenteredView(page.btnSubmitQuery);
        page.btnSubmitQuery.click();
        expect(page.searchResults.count()).toEqual(3);
    });

    //query-flags-container
    it("should show query-flags-container and disable rest of search form", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.clear().sendKeys("-i abuse-c -T organisation -Br --sources RIPE ANNA");
        expect(page.inpQueryFlagsContainer.isDisplayed()).toBeTruthy();
        expect(page.typeMenu.isPresent()).toBeFalsy();
        expect(page.hierarchyFlagsMenu.isPresent()).toBeFalsy();
        expect(page.inverseLookupMenu.isPresent()).toBeFalsy();
        expect(page.advanceFilterMenu.isPresent()).toBeFalsy();
    });

    it("should show query-flags-container with adequate flags", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
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

    it("should show error banner when flag is invalid and valid flag in query flag container", async () => {
        await page.scrollIntoCenteredView(page.inpQueryString);
        page.inpQueryString.clear().sendKeys("-z --sources RIPE ANNA");
        expect(page.inpQueryFlags.get(0).getText()).toContain("-s");
        expect(page.inpQueryFlags.get(1).getText()).toContain("--sources");
        page.btnSubmitQuery.click();
        expect(page.errorAlert.isPresent()).toEqual(true);
        expect(page.errorAlert.getText()).toContain("ERROR:111: invalid option supplied. Use help query to see the valid options.");
    });

});
