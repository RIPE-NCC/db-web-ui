import {browser} from "protractor";

const page = require("./homePageObject");

describe("The aut-num editor", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
    });

    it("should create new aut-num object", () => {
        page.selectObjectType("aut-num").click();
        page.btnNavigateToCreate.click();
        page.inpAutnum.sendKeys("AS9777");
        // submit button shouldn't be available
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
        page.scrollIntoView(page.inpAsName);
        page.inpAsName.click();
        page.inpAsName.sendKeys("NPIX-AS");
        page.inpAdminC.sendKeys("LG1-RIPE");
        page.inpTechC.sendKeys("LG1-RIPE");

        expect(page.inpSource.getAttribute("value")).toEqual("RIPE");
        expect(page.inpSource.getAttribute("disabled")).toBeTruthy();
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });

    it("should fail creating new aut-num object and show page with error messages", () => {
        page.selectObjectType("aut-num").click();
        page.btnNavigateToCreate.click();
        page.inpAutnum.sendKeys("AS19905");
        page.scrollIntoView(page.inpAsName);
        page.inpAsName.click();
        page.inpAsName.sendKeys("TEST-AS");
        page.inpAdminC.sendKeys("LG1-RIPE");
        page.inpTechC.sendKeys("LG1-RIPE");
        expect(page.inpSource.getAttribute("value")).toEqual("RIPE");
        expect(page.inpSource.getAttribute("disabled")).toBeTruthy();
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
        page.btnSubmitForm.click();
        // should auto scroll to error message above field with error
        expect(page.errorAlert.getText()).toEqual(`Authorisation for [as-block] AS19400 - AS20479 failed using "mnt-by:" not authenticated by: RIPE-DBM-MNT\nCannot create out of region aut-num objects`);
    });

});
