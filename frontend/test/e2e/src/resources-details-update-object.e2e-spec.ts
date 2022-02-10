import {browser} from "protractor";
import {waitToBeClickable} from "./fixtures";

const page = require("./homePageObject");

describe("Resources, update object", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
        browser.manage().addCookie({name: "activeMembershipId", value: "3629", path: "/"});
        browser.get(browser.baseUrl + "myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/");
    });

    it("should allow editing of the object", async () => {
        page.btnUpdateObjectButton.click();
        page.modalInpPassword.sendKeys("TPOL888-MNT");
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpDescr.isPresent()).toBe(true);
        page.inpDescr.sendKeys("Updated test description");

        page.btnAddAnAttribute(page.inpDescr).click();
        page.modalBtnSubmit.click();

        expect(page.inpDescr2.isPresent()).toBe(true);
        await waitToBeClickable(page.btnRemoveAttribute(page.inpDescr2));
        page.btnRemoveAttribute(page.inpDescr2).click();
        expect(page.inpDescr2.isPresent()).toBe(false);

        page.btnSubmitObject.click();
        expect(page.successMessage.isPresent()).toBe(true);
    });

    describe("not comaintained by ripe", () =>  {

        beforeEach(() => {
            browser.get(browser.baseUrl + "myresources/detail/inetnum/3.0.103.0%2520-%25203.0.103.255/false");
            page.removeCookiesBanner();
        });

        it("should edit netname", () => {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("TPOLYCHNIA4-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            // ensure netname is editable and edit it
            expect(page.woeNetname.getAttribute("disabled")).toBeFalsy();
            page.woeNetname.clear();
            page.woeNetname.sendKeys("some netname");

            // and check the value has changed correctly
            expect(page.woeNetname.getAttribute("value")).toBe("some netname");
        });

        it("should add org attribute", () => {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("TPOLYCHNIA4-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            // add org attribute
            page.woeBtnAddAttribute.click();
            page.modalOrg.click();
            page.modalBtnSubmit.click();

            // and check it's there
            expect(page.woeOrg.isPresent()).toBe(true);
        });

        it("should contain delete button for not co-maintained by RIPE-NCC-*-MNT", () => {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("TPOLYCHNIA4-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            expect(page.btnDeleteObjectWhoisEditor.isPresent()).toBe(true);
        });

        it("should delete resource on click on delete button", () => {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("TPOLYCHNIA4-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            page.scrollIntoView(page.btnDeleteObjectWhoisEditor);
            page.btnDeleteObjectWhoisEditor.click();

            expect(page.modalDeleteObject.isPresent()).toBe(true);
            page.btnConfirmModalDelete.click();
            expect(page.modalDeleteObject.isPresent()).toBe(false);
            expect(browser.getCurrentUrl()).toContain("myresources/detail/inetnum/3.0.103.0%20-%203.0.127.255/false?alertMessage=The%20inetnum%20for%203.0.103.0%20-%203.0.103.255%20has%20been%20deleted");
            expect(page.infoMessage.isPresent()).toBeTruthy();
            expect(page.infoMessage.getText())
                .toContain("The inetnum for 3.0.103.0 - 3.0.103.255 has been deleted");
        });
    });

    describe("comaintained by ripe", () =>  {

        beforeEach(() => {
            browser.get(browser.baseUrl + "myresources/detail/inetnum/194.171.0.0%20-%20194.171.255.255/false");
        });

        it("should not contain delete button for co-maintained by RIPE-NCC-*-MNT", () => {
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("TDACRUZPER2-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            expect(page.btnDeleteObjectWhoisEditor.isPresent()).toBe(false);
        });
    });
});
