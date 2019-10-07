// Local requires
var page = require("./homePageObject");

/*
 * Tests...
 */
describe("The route editor", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
    });

    it("should create new route object", () => {
        page.selectObjectType("route").click();
        page.btnNavigateToCreate.click();
        page.inpRoute.sendKeys("211.43.192.0/19\t");
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
