import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying an maintainer", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "webupdates/modify/RIPE/mntner/SHRYANE-MNT");
    });

    it("should add auth attribute after associate maintainer", () => {
        expect(page.modal.isPresent()).toBeTruthy();
        page.modalInpPassword.sendKeys("SHRYANE-MNT");
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBeFalsy();
        page.scrollIntoView(page.inpAuth.get(0));
        expect(page.inpAuth.get(0).isPresent()).toBeTruthy();
        expect(page.inpAuth.get(0).getAttribute("value")).toBe("MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1");
        expect(page.inpAuth.get(1).getAttribute("value")).toBe("SSO isvonja@ripe.net");
        expect(page.inpAuth.get(2).getAttribute("value")).toBe("SSO bad@ripe.net");
    });

    it("should unfiltered auth after associate maintainer", () => {
        expect(page.modal.isPresent()).toBeTruthy();
        page.modalInpPassword.sendKeys("SHRYANE-MNT");
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBeFalsy();
        page.scrollIntoView(page.inpAuth.get(0));
        expect(page.inpAuth.get(0).isPresent()).toBeTruthy();
        expect(page.inpAuth.get(0).getAttribute("value")).toBe("MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1");
        expect(page.inpAuth.get(1).getAttribute("value")).toBe("SSO isvonja@ripe.net");
    });

    it("should unfiltered auth after password authentification", () => {
        expect(page.modal.isPresent()).toBeTruthy();
        page.modalInpPassword.sendKeys("SHRYANE-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBeFalsy();
        page.scrollIntoView(page.inpAuth.get(0));
        expect(page.inpAuth.get(0).isPresent()).toBeTruthy();
        expect(page.inpAuth.get(0).getAttribute("value")).toBe("MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1");
        expect(page.inpAuth.get(1).getAttribute("value")).toBe("SSO bad@ripe.net");
    });
});
