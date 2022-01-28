import {browser, protractor} from "protractor";

const page = require("./homePageObject");

describe("The route editor", () => {

    beforeEach(() => {
        browser.get(`${browser.baseUrl}webupdates/select`);
    });

    it("should create new route object", () => {
        page.selectObjectType("route").click();
        page.btnNavigateToCreate.click();
        page.inpRoute.sendKeys("211.43.192.0/19");
        page.inpRoute.sendKeys(protractor.Key.TAB);
        // submit button shouldn't be available
        page.scrollIntoView(page.btnSubmitForm);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
        page.scrollIntoView(page.inpOrigin);
        page.inpOrigin.sendKeys("AS9777");

        expect(page.inpSource.getAttribute("value")).toEqual("RIPE");
        expect(page.inpSource.getAttribute("disabled")).toBeTruthy();
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });

});
