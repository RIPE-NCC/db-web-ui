import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying a resource for a NONAUTH-RIPE route object", () => {

    beforeEach(async () => {
        await page.navigateTo(browser.baseUrl + "webupdates/modify/ripe/route/211.43.192.0%252F19AS9777");
        await page.disableLiveChat();
    });

    it("should show out of region route object", async () => {
        page.modalInpPassword.sendKeys("AS4663-RIPE-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpRoute.getAttribute("disabled")).toBeTruthy();
        expect(page.inpOrigin.getAttribute("disabled")).toBeTruthy();
        expect(page.inpSource.getAttribute("disabled")).toBeTruthy();
        expect(page.inpSource.getAttribute("value")).toEqual("RIPE-NONAUTH");
        expect(page.btnDeleteObject.isPresent()).toBeTruthy();
        await page.scrollIntoCenteredView(page.btnSubmitModify);
        expect(page.btnSubmitModify.isPresent()).toBeTruthy();
    });

    it("should be possible for RC to submit change on out of region route object", async () => {
        page.modalInpPassword.sendKeys("AS4663-RIPE-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        await page.scrollIntoCenteredView(page.inpDescrCreateForm);
        page.inpDescrCreateForm.sendKeys("update");
        await page.scrollIntoCenteredView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE/route/211.43.192.0%2F19AS9777?method=Modify");
        expect(page.successMessage.getText()).toContain("Your object has been successfully modified");
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
    });

    it("should be possible for RC to delete out of region route object", async () => {
        page.modalInpPassword.sendKeys("AS4663-RIPE-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        await page.scrollIntoCenteredView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/delete/ripe/route/211.43.192.0%2F19AS9777?onCancel=webupdates%2Fmodify");
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
        expect(page.successMessage.getText()).toContain("The following object(s) have been successfully deleted");
    });

    it("should remove info message on navigating to query page", async () => {
        // deleting object
        page.modalInpPassword.sendKeys("AS4663-RIPE-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        page.btnDeleteObject.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/delete/ripe/route/211.43.192.0%2F19AS9777?onCancel=webupdates%2Fmodify");
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
        expect(page.successMessage.getText()).toContain("The following object(s) have been successfully deleted");
        // navigating to query page should remove alert component
        await page.scrollIntoCenteredView(page.ripeDatabaseMenuItem);
        page.ripeDatabaseMenuItem.click();
        page.ripeDatabaseQueryMenuItems.click();
        expect(browser.getCurrentUrl()).toContain("query");
        expect(page.successMessage.isPresent()).toBeFalsy();
        page.inpQueryString.sendKeys("193.0.0.0")
    });

    it("should allow force delete on modal-authentication window and navigate to forceDelete", () => {
        expect(page.modal.isPresent()).toEqual(true);
        page.modalInpPassword.sendKeys("AS4663-RIPE-MNT");
        page.modalInpAssociate.click();
        page.modalForceDelete.click();
        expect(browser.getCurrentUrl()).toContain("forceDelete/ripe/route/211.43.192.0%2F19AS9777");
        expect(page.modal.isPresent()).toEqual(false);
    });
});
