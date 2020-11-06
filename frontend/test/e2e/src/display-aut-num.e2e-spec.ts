import {browser} from "protractor";

const page = require("./homePageObject");

describe("Display an aut-num", () => {

    it("should sanitized img and script tag - XSS attack", () => {
        browser.get(browser.baseUrl + "webupdates/display/RIPE/aut-num/as210089?method=Modify");
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE/aut-num/as210089?method=Modify");
        expect(page.successMessage.getText()).toEqual("Your object has been successfully modified");
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
        expect(page.displayPanelImgTag.isPresent()).toBeFalsy();
        expect(page.displayPanelScriptTag.isPresent()).toBeFalsy();
    });

    it("should show umlaut", () => {
        browser.get(browser.baseUrl + "webupdates/display/RIPE/aut-num/as210089?method=Modify");
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE/aut-num/as210089?method=Modify");
        expect(page.successMessage.getText()).toEqual("Your object has been successfully modified");
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
        expect(page.displayPanel.getText()).toContain("Ümlaüt");
    });

    it("should contain + in front of each added row", () => {
        browser.get(browser.baseUrl + "webupdates/modify/RIPE-NONAUTH/aut-num/AS24835");
        page.modalInpPassword.sendKeys("RAYA-MNT");
        page.modalBtnSubmit.click();
        page.scrollIntoView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        // display page after "adding" 3 imports
        expect(browser.getCurrentUrl()).toContain("webupdates/display/RIPE-NONAUTH/aut-num/AS24835?method=Modify");
        expect(page.successMessage.getText()).toEqual("Your object has been successfully modified");
        // added 3 imports and + last-modify
        expect(page.panelInsTextDiff.count()).toEqual(4);
        // last-modify
        expect(page.panelDelTextDiff.count()).toEqual(1);
    });
});
