import {browser} from "protractor";

const page = require("./homePageObject");
const fs = require("fs");

describe("Delete a role object", () => {

    it("should be able to pick up reason of deleting object", async () => {
        page.navigateTo(browser.baseUrl + "webupdates/modify/ripe/role/IA6414-RIPE");
        expect(page.modal.isPresent()).toBe(false);
        await page.scrollIntoCenteredView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(page.modal.isPresent()).toBe(true);
        page.modalInpReason.clear();
        page.modalInpReason.sendKeys("my own reason");
        await page.scrollIntoCenteredView(page.btnConfirmDeleteObject);
        expect(page.btnConfirmDeleteObject.isPresent()).toBeTruthy();
        page.btnConfirmDeleteObject.click();
        // won't get to display page in case reason is not "my own reason", because we have mock of response for
        // this reason. Otherwise it will generate new *.json.404
        expect(browser.getCurrentUrl()).toContain("webupdates/delete/ripe/role/IA6414-RIPE?onCancel=webupdates%2Fmodify");
    });

});
