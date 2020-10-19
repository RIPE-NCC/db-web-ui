import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying a role object", () => {

    it("should be able to modify object even if object type is in capital letters", () => {
        browser.get(browser.baseUrl + "webupdates/modify/RIPE/ROLE/ABDE2-RIPE");
        page.modalInpPassword.sendKeys("AS8560-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        page.scrollIntoView(page.inpAbuseMailbox);
        page.inpAbuseMailbox.sendKeys("newemail@ripe.net");
        page.scrollIntoView(page.btnSubmitModify);
        expect(page.btnSubmitModify.isPresent()).toBeTruthy();
        page.btnSubmitModify.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE/ROLE/ABDE2-RIPE?method=Modify");
    });
});
