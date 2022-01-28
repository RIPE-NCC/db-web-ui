import {browser, protractor} from "protractor";

const page = require("./homePageObject");
const until = protractor.ExpectedConditions;

describe("The CreateSelfMntnerComponent", () => {

    beforeEach(() => {
        browser.get(`${browser.baseUrl}webupdates/select`);
    });

    it("should redirect to create pair person and maintainer on click on link", () => {
        page.selectObjectType("mntner").click();
        page.btnNavigateToCreate.click();
        expect(page.linkToCreatePair.isPresent()).toBeTruthy();
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/mntner/self");
        page.linkToCreatePair.click();
        browser.wait(browser.isElementPresent(page.inpMntner), 1000, "waited too long");
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/person/self");
    });

    it("should suggest adminC after entering letters", () => {
        page.selectObjectType("mntner").click();
        page.btnNavigateToCreate.click();
        expect(page.inpAdminCDropdown.isPresent()).toBeTruthy();
        page.inpAdminCDropdown.sendKeys("IV");
        page.inpAdminCDropdown.click();
        browser.wait(until.visibilityOf(page.inpAdminCDropdownOptions), 1000, "waited too long");
        expect(page.inpAdminCDropdownOptions.isPresent()).toBeTruthy();
    });

    it("should show mntner after adminC was chosen", () => {
        page.selectObjectType("mntner").click();
        page.btnNavigateToCreate.click();
        expect(page.inpAdminCDropdown.isPresent()).toBeTruthy();
        expect(page.inpMntner.isDisplayed()).toBeFalsy();
        page.inpAdminCDropdown.sendKeys("IV");
        page.inpAdminCDropdown.click();
        browser.wait(until.visibilityOf(page.inpAdminCDropdownOptions), 1000, "waited too long");
        expect(page.inpAdminCDropdownOptions.isPresent()).toBeTruthy();
        page.inpAdminCDropdownOptions.click();
        expect(page.inpMntner.isPresent()).toBeTruthy();
    });

    it("should navigate to create self maintainer page on click on button Create Shared Maintainer", () => {
        browser.get(browser.baseUrl + "webupdates/display/RIPE/person/ES13374-RIPE/mntner/ESMA-MNT");
        page.disableLiveChat();
        expect(page.btnCreateSharedMaintainer.isPresent()).toEqual(true);
        page.scrollIntoView(page.btnCreateSharedMaintainer);
        page.btnCreateSharedMaintainer.click();
        expect(browser.getCurrentUrl()).toContain("webupdates/create/RIPE/mntner/self?admin=ES13374-RIPE");
        expect(page.inpMntner.isDisplayed()).toBeTruthy();
        expect(page.selectAdminC.getText()).toContain("ES13374-RIPE");
    });
});
