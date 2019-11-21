import {browser} from "protractor";

const page = require("./homePageObject");

describe("The full text search", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "fulltextsearch");
    });

    it("should be able to search using the text box", () => {
        page.byId("fullTextSearchInput").sendKeys("193.0.0.0");
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.count()).toEqual(7);
        expect(page.byId("fullTextSearchInput").getAttribute("value")).toEqual("193.0.0.0");
    });

    it("should warrning message when no results of search", () => {
        page.byId("fullTextSearchInput").sendKeys("nemam");
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.warningAlert.isPresent()).toBeTruthy();
        expect(page.warningAlert.getText())
            .toEqual("No results were found for your search. Your search details may be too selective.");
    });

    it("should be able to add a filter by clicking on summary", () => {
        page.byId("fullTextSearchInput").sendKeys("193.0.0.0");
        page.scrollIntoView(page.byId("fullTextSearchInput"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.count()).toEqual(7);
        expect(page.fullTextResultSummaryRow.get(0).getText()).toContain("inetnum");
        page.scrollIntoView(page.fullTextResultSummaryRow.get(0));
        page.fullTextResultSummaryRow.get(0).click(); // click on "inetnum"
        expect(page.fullTextSearchResults.count()).toEqual(3);
    });

    it("should be able to search using advanced options", () => {
        page.byId("fullTextSearchInput").sendKeys("193.0.0.0 ripe");
        page.byId("fullTextAdvanceModeLink").click();

        expect(page.byId("fullTextAdvancedTypeAll").isPresent()).toEqual(true);
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.count()).toEqual(7);

        page.scrollIntoView(page.byId("fullTextAdvancedTypeAny"));
        page.byId("fullTextAdvancedTypeAny").click();
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.count()).toEqual(10);

        page.scrollIntoView(page.byId("fullTextAdvancedTypeExact"));
        page.byId("fullTextAdvancedTypeExact").click();
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.count()).toEqual(0);
    });

    it("should sanitized img and script tag - XSS attack", () => {
        page.byId("fullTextSearchInput").sendKeys("Jamesits");
        page.scrollIntoView(page.byId("fullTextSearchButton"));
        page.byId("fullTextSearchButton").click();
        expect(page.fullTextSearchResults.get(0).getText()).not.toContain("<img");
        expect(page.fullTextSearchResults.get(0).getText()).not.toContain("script");
    });

});
