// Local requires
const page = require("./homePageObject");

describe("Find Maintainer", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "#/fmp/");
    });

    it("should load the page with the search form", () => {
        expect(page.findMaintainerForm.isPresent()).toEqual(true);
        expect(page.searchMaintainer.isPresent()).toEqual(true);
        expect(page.searchMaintainer.getText()).toEqual("Search");
        expect(page.searchMaintainerCancel.isPresent()).toEqual(true);
        expect(page.searchMaintainerCancel.getText()).toEqual("Cancel");
        expect(page.inputMaintainer.isPresent()).toEqual(true);
        expect(page.maintainerContainer.isPresent()).toEqual(false);
    });

    it("should load the maintainer into page after search", () => {
        expect(page.maintainerContainer.isPresent()).toEqual(false);
        page.scrollIntoView(page.findMaintainerForm);
        page.inputMaintainer.clear().sendKeys("shryane-mnt");
        page.searchMaintainer.click();
        expect(page.maintainerContainer.isPresent()).toEqual(true);

        const maintainerContainer = page.maintainerContainer.getText();
        expect(maintainerContainer).toContain("Please check that this is the correct object before proceeding.");
        expect(maintainerContainer).toContain("SHRYANE-MNT");
        expect(maintainerContainer).toContain("ES7554-RIPE");
        expect(maintainerContainer).toContain("eshryane@ripe.net");
        expect(maintainerContainer).toContain("2013-12-10T16:55:06Z");
        expect(maintainerContainer).toContain("2016-10-11T14:51:12Z");
        expect(maintainerContainer).toContain("RIPE");
        expect(maintainerContainer).toContain("An email containing further instructions will be sent to the address eshryane@ripe.net.");
        expect(maintainerContainer).toContain("I have access to eshryane@ripe.net. Take me to the automated recovery process");
        expect(maintainerContainer).toContain("I do not have access to eshryane@ripe.net. Take me to the manual recovery process");
    });

    it("should hide previous error alert after maintainer was found", () => {
        expect(page.maintainerContainer.isPresent()).toEqual(false);
        page.scrollIntoView(page.findMaintainerForm);
        page.inputMaintainer.clear().sendKeys("svonja");
        page.searchMaintainer.click();
        expect(page.errorAlert.isPresent()).toEqual(true);

        page.inputMaintainer.clear().sendKeys("shryane-mnt");
        page.searchMaintainer.click();
        expect(page.errorAlert.isPresent()).toEqual(false);
    });

});
