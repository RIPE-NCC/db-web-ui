import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying a resource for a RIPE maintained object", () => {

    beforeEach(() => {
        page.navigateTo(browser.baseUrl + "webupdates/modify/ripe/inetnum/91.208.34.0%20-%2091.208.34.255");
    });

    it("should show org and sponsoring-org as read-only", () => {
        // org is disabled because object is managed by RIPE
        expect(page.inpOrg.isPresent()).toEqual(true);
        expect(page.inpOrg.getAttribute("disabled")).toBeTruthy();
        expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
        expect(page.inpSponsoringOrg.getAttribute("disabled")).toBeTruthy();
    });

    it("should redirect to the correct url ", () => {
        const originalUrl = browser.baseUrl + "webupdates/modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255";
        urlChanged(originalUrl);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "webupdates/modify/ripe/inetnum/91.208.34.0%20-%2091.208.34.255");
    });

    const urlChanged = (url) => {
        return () => {
            return browser.getCurrentUrl().then((actualUrl) => {
                return url !== actualUrl;
            });
        };
    };

});
