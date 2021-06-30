import {browser, protractor} from "protractor";

const page = require("./homePageObject");

describe("The inetnum editor", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
        page.disableLiveChat();
        page.removeCookiesBanner();
    });

    it("should ask for authentication of parent inetnum", () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("213.159.160.0-213.159.190.255");
        page.scrollIntoView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("ERICSSON-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        page.inpNetname.sendKeys("bogus-netname1");
        page.scrollIntoView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("aa1-ripe");
        page.inpTechC.sendKeys("aa1-ripe");
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain("ASSIGNED PA");
        expect(page.inpStatusList.get(1).getText()).toContain("LIR-PARTITIONED PA");
        expect(page.inpStatusList.get(2).getText()).toContain("SUB-ALLOCATED PA");
        page.scrollIntoView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });

    it("should ask for authentication of parent inetnum and handle a bad password properly", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("213.159.160.0-213.159.190.255");
        page.scrollIntoView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("xxx");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modalBody.getText()).toContain("You have not supplied the correct password for mntner");
        page.scrollIntoView(page.modalClose);
        page.modalClose.click();
        await browser.sleep(1000);
        expect(page.modal.isPresent()).toBe(false);
        page.inpNetname.sendKeys("bogus-netname1");
        page.scrollIntoView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("aa1-ripe");
        page.inpTechC.sendKeys("aa1-ripe");
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain("ASSIGNED PA");
        expect(page.inpStatusList.get(1).getText()).toContain("LIR-PARTITIONED PA");
        expect(page.inpStatusList.get(2).getText()).toContain("SUB-ALLOCATED PA");
        page.scrollIntoView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should NOT be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
    });

    it("should show an editor for inet6num", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("inet6num").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "inet6num" object`);
        page.inpInet6num.sendKeys("2001:888:2000::/38");
        page.inpInet6num.sendKeys(protractor.Key.TAB);
        browser.wait(function () {
            return browser.isElementPresent(page.modalBtnSubmit);
        }, 5000);
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys("XS4ALL-MNT");
        page.modalBtnSubmit.click();

        page.scrollIntoView(page.inpStatusLink); // bring "status" into view
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(2);
        expect(page.inpStatusList.get(0).getText()).toEqual("AGGREGATED-BY-LIR");
        expect(page.inpStatusList.get(1).getText()).toEqual("ASSIGNED");
    });

    it("should sanitized img and script tag - XSS attack", () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpNetname.click();
        page.inpNetname.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.scrollIntoView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpTechC.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        page.inpStatusList.get(0).click();
        page.btnSubmitForm.click();
        browser.wait(function () {
            return browser.isElementPresent(page.prefixErrMsg);
        }, 5000);
        expect(page.prefixErrMsg.getText()).not.toContain("<img");
        expect(page.prefixErrMsg.getText()).toContain("Syntax error in img src=");
    });

    it("should open description just under field on click on question mark", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnumQuestionMark.click();
        expect(page.inpInetnumDescription.isDisplayed()).toBeTruthy();
        // await browser.sleep(500);
        expect(page.inpInetnumDescription.getText()).toContain("Specifies a range of IPv4 that the inetnum object presents.");
        expect(page.inpNetnameDescription.isDisplayed()).toBeFalsy();
        page.inpNetnameQuestionMark.click();
        expect(page.inpNetnameDescription.isDisplayed()).toBeTruthy();
        expect(page.inpInetnumDescription.isDisplayed()).toBeTruthy();
        page.inpInetnumQuestionMark.click();
        await browser.sleep(1000);
        expect(page.inpInetnumDescription.isDisplayed()).toBeFalsy();
        expect(page.inpNetnameDescription.isDisplayed()).toBeTruthy();
    });

    it("should enable submit button", () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("5.254.68.40/29");
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("VOXILITY-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        page.inpNetname.sendKeys("SOMETHING");
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("WW2105-RIPE");
        page.inpTechC.sendKeys("WW2105-RIPE");
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
        page.inpStatusLink.click();
        page.scrollIntoView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });
});
