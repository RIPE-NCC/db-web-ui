import {browser} from "protractor";

const page = require("./homePageObject");

describe("The syncupdates page", () => {

    beforeEach(() => {
        page.navigateTo(browser.baseUrl + "syncupdates");
    });

    it("should not show preview section if is empty object", async () => {
        page.inpSyncupdateString.sendKeys("");
        expect(page.inpSyncupdateString.getAttribute("value")).toEqual("");
        await page.scrollIntoCenteredView(page.btnUpdate);
        page.btnUpdate.click(); // nothing should happen, everything is ok
        expect(page.inpSyncupdateString.getAttribute("value")).toEqual("");
        expect(page.viewSyncupdateString.isPresent()).toEqual(false);
    });

    it("should show preview area in case object is incorrect", async () => {
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
        await page.scrollIntoCenteredView(page.btnUpdate);
        page.btnUpdate.click();
        expect(page.viewSyncupdateString.getText()).toContain(response);
    });

    it("should contain instruction text", () => {
        expect(page.instructionsSyncupdate.isPresent()).toBeTruthy();
        expect(page.instructionsSyncupdate.getText()).toEqual("Instructions\n" +
            "You can include one or more RPSL objects in the text area above, each object separated by an empty line.\n" +
            "To authenticate as a MNTNER, include one or more \"password:\" attributes on a separate line. If you are logged in to RIPE NCC Access, your credential is submitted automatically.\n" +
            "To test an update without making any changes, include a \"dry-run:\" attribute. More information\n" +
            "For more information about Syncupdates, please refer to the Syncupdates section in the RIPE NCC Database Manual.");
    });
});
