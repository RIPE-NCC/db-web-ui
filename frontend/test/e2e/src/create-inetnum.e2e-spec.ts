import {browser, protractor} from "protractor";

const page = require("./homePageObject");

describe("The inetnum editor", () => {

    beforeEach(async () => {
        await page.navigateTo(`${browser.baseUrl}webupdates/select`);
        await page.disableLiveChat();
        await page.removeCookiesBanner();
    });

    it("should ask for authentication of parent inetnum", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("213.159.160.0-213.159.190.255");
        await page.scrollIntoCenteredView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("ERICSSON-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        page.inpNetname.sendKeys("bogus-netname1");
        await page.scrollIntoCenteredView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("aa1-ripe");
        page.inpTechC.sendKeys("aa1-ripe");
        page.inpAdminC.click();
        await page.scrollIntoCenteredView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain("ASSIGNED PA");
        expect(page.inpStatusList.get(1).getText()).toContain("LIR-PARTITIONED PA");
        expect(page.inpStatusList.get(2).getText()).toContain("SUB-ALLOCATED PA");
        await page.scrollIntoCenteredView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });

    it("should ask for authentication of parent inetnum and handle a bad password properly", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("213.159.160.0-213.159.190.255");
        await page.scrollIntoCenteredView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("xxx");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modalBanner.getText()).toContain("You have not supplied the correct password for mntner");
        await page.scrollIntoCenteredView(page.modalClose);
        page.modalClose.click();
        await browser.sleep(1000);
        expect(page.modal.isPresent()).toBe(false);
        page.inpNetname.sendKeys("bogus-netname1");
        await page.scrollIntoCenteredView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("aa1-ripe");
        page.inpTechC.sendKeys("aa1-ripe");
        page.inpAdminC.click();
        await page.scrollIntoCenteredView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain("ASSIGNED PA");
        expect(page.inpStatusList.get(1).getText()).toContain("LIR-PARTITIONED PA");
        expect(page.inpStatusList.get(2).getText()).toContain("SUB-ALLOCATED PA");
        await page.scrollIntoCenteredView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should NOT be available
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
    });

    it("should show an editor for inet6num", async () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("inet6num").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "inet6num" object`);
        page.inpInet6num.sendKeys("2001:888:2000::/38");
        page.inpInet6num.sendKeys(protractor.Key.TAB);
        await browser.wait(function () {
            return browser.isElementPresent(page.modalBtnSubmit);
        }, 5000);
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys("XS4ALL-MNT");
        page.modalBtnSubmit.click();

        await page.scrollIntoCenteredView(page.inpStatusLink); // bring "status" into view
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(2);
        expect(page.inpStatusList.get(0).getText()).toEqual("AGGREGATED-BY-LIR");
        expect(page.inpStatusList.get(1).getText()).toEqual("ASSIGNED");
    });

    it("should sanitized img and script tag - XSS attack", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpNetname.click();
        page.inpNetname.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        await page.scrollIntoCenteredView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpTechC.sendKeys("<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>");
        page.inpAdminC.click();
        await page.scrollIntoCenteredView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        page.inpStatusList.get(0).click();
        await page.scrollIntoCenteredView(page.btnSubmitForm);
        page.btnSubmitForm.click();
        await browser.wait(function () {
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
        await browser.sleep(100);
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

    it("should enable submit button", async () => {
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
        await page.scrollIntoCenteredView(page.inpStatusLink);
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeTruthy();
        page.inpStatusLink.click();
        await page.scrollIntoCenteredView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        expect(page.btnSubmitForm.getAttribute("disabled")).toBeFalsy();
    });

    it("should show field validation errors", async () => {
        page.selectObjectType("inetnum").click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys("5.254.68.40/29");
        page.inpNetname.click();
        page.modalInpPassword.sendKeys("VOXILITY-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        page.inpNetname.sendKeys("SOMETHING.");
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys("WW2105-RIPE");
        page.inpTechC.sendKeys("WW2105-RIPE");
        page.inpAdminC.click();
        await page.scrollIntoCenteredView(page.inpStatusLink);
        page.inpStatusLink.click();
        await page.scrollIntoCenteredView(page.inpStatusList.get(0));
        page.inpStatusList.get(0).click();
        await page.scrollIntoCenteredView(page.btnSubmitForm);
        page.btnSubmitForm.click();
        expect(page.prefixErrMsg.getText()).toContain("Value 5.254.68.40/29 converted to 5.254.68.40 - 5.254.68.47");
        expect(page.netnameErrMsg.getText()).toContain("Syntax error in SOMETHING.");
    });
});
