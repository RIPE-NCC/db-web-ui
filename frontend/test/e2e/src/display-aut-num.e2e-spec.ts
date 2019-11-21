import {browser} from "protractor";

const page = require("./homePageObject");

describe("Display an aut-num", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "webupdates/display/RIPE/aut-num/as210089?method=Modify");
    });

    it("should sanitized img and script tag - XSS attack", () => {
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE/aut-num/as210089?method=Modify");
        expect(page.successMessage.getText()).toEqual("Your object has been successfully modified");
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
        expect(page.displayPanel.getText()).not.toContain("<img");
        expect(page.displayPanel.getText()).not.toContain("script");
    });
});
