import {browser} from "protractor";

const page = require("./homePageObject");

describe("The syncupdates page", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "syncupdates");
    });

    it("should not show preview section if is empty object", () => {
        page.inpSyncupdateString.sendKeys("");
        expect(page.inpSyncupdateString.getAttribute("value")).toEqual("");
        page.scrollIntoView(page.btnUpdate);
        page.btnUpdate.click(); // nothing should happen, everything is ok
        expect(page.inpSyncupdateString.getAttribute("value")).toEqual("");
        expect(page.viewSyncupdateString.isPresent()).toEqual(false);
    });

    it("should show preview area in case object is incorrect", () => {
        const response =
            "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
            "The following paragraph(s) do not look like objects\n" +
            "and were NOT PROCESSED:\n" +
            "\n" +
            "something\n" +
            "\n" +
            "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";

        page.inpSyncupdateString.sendKeys("something");
        expect(page.inpSyncupdateString.getAttribute("value")).toEqual("something");
        page.scrollIntoView(page.btnUpdate);
        page.btnUpdate.click();
        expect(page.viewSyncupdateString.getText()).toContain(response);
    });

    it("should open beta syncupdate", () => {
        page.scrollIntoView(page.btnSwitchSyncupdates);
        page.btnSwitchSyncupdates.click();
        expect(browser.getCurrentUrl()).toContain("textupdates/multi");
    });

});
