import {browser} from "protractor";

const page = require("./homePageObject");

describe("webupdates", () => {

    it("should show 'force delete' for an inetnum if NOT allocated by RIPE", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inetnum/194.219.52.224%20-%20194.219.52.239");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toContain("Force delete this object?");
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inetnum/91.208.34.0%20-%2091.208.34.255");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toBe("Submit"); // cz only the button is shewn
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE and no extra mntners", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inetnum/185.102.172.0%20-%20185.102.175.255");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain("The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.");
        expect(page.modalFooter.getText()).toBe("Cancel"); // cz only the cancel button is shewn
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE and no mntners have a passwd", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inetnum/186.102.172.0%20-%20186.102.175.255");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain("You cannot modify this object here because your SSO account is not associated with any of the maintainers and none of the maintainers are protected with an MD5 password");
        expect(page.modalFooter.getText()).toBe("Cancel");
    });

    it("should show 'force delete' for an inet6num if NOT allocated by RIPE", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inet6num/2001%253A978%253Affff%253Afffe%253A%253A%252F64");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toContain("Force delete this object?");
    });

    it("should NOT show 'force delete' for an inet6num if allocated by RIPE and no mntners have a passwd", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/display/ripe/inet6num/2001%253Aa08%253A%253A%252F32");
        expect(page.btnModify.isPresent()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnModify);
        page.btnModify.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modal.getText()).toContain("The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.");
        expect(page.modalFooter.getText()).toBe("Cancel");
    });

});
