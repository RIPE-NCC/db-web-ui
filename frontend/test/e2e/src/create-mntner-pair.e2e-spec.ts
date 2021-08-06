import {browser} from "protractor";

const page = require("./homePageObject");

describe("The CreateMntnerPairComponent", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
    });

    it("should switch to person maintainer pair page on click on person link", () => {
        page.selectObjectType("role and maintainer pair").click();
        page.btnNavigateToCreate.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/role/self");
        page.switchToPersonObject.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/person/self");
        page.switchToPersonObject.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/role/self");
    });

    it("should show syntax error over person field", () => {
        page.selectObjectType("role and maintainer pair").click();
        page.btnNavigateToCreate.click();
        page.switchToPersonObject.click();
        page.inpMntner.sendKeys("UNA-TEST-MNT");
        page.inpPerson.sendKeys("Üna Švoña");
        page.inpAddress.sendKeys("Utrecht");
        page.inpPhone.sendKeys("+3161234567");
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
        expect(page.prefixErrMsg.getText()).toEqual("Input contains unsupported characters.");
    });

    it("should open description under mntner field on click on question mark", async () => {
        page.selectObjectType("role and maintainer pair").click();
        page.btnNavigateToCreate.click();
        page.switchToPersonObject.click();
        expect(page.inpMntnerDescription.isDisplayed()).toBeFalsy();
        page.inpMntnerQuestionMark.click();
        expect(page.inpMntnerDescription.isDisplayed()).toBeTruthy();
        await browser.sleep(100);
        expect(page.inpMntnerDescription.getText()).toContain("Description");
        expect(page.inpMntnerDescription.getText()).toContain("A unique identifier of the mntner object.");
        expect(page.inpMntnerDescription.getText()).toContain("Syntax");
        expect(page.inpMntnerDescription.getText()).toContain("Made up of letters, digits, the underscore \"_\" and hyphen \"-\". The first character of a name must be a letter, and the last character a letter or digit. Note that certain words are reserved by RPSL and cannot be used.");
    });

    it("should sanitized img and script tag - XSS attack", () => {
        page.disableLiveChat();
        page.selectObjectType("role and maintainer pair").click();
        page.btnNavigateToCreate.click();
        page.switchToPersonObject.click();
        page.inpMntner.sendKeys("<img src='https://www.yarrah.com/en/wp-content/uploads/sites/10/2019/01/Puppy-aanschaffen-header-800x600.png'/>");
        page.inpPerson.sendKeys("Ivana Svonja");
        page.inpAddress.sendKeys("Utrecht");
        page.inpPhone.sendKeys("+3161234567");
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
        page.btnSubmitForm.click();
        expect(page.prefixErrMsg.getText()).not.toContain("<img");
        expect(page.prefixErrMsg.getText()).toContain("Syntax error in img src=");
    });
});
