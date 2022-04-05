import {browser} from "protractor";
import {waitToBeClickable} from "./fixtures";

const page = require("./homePageObject");

describe("Deleting an as-set", () => {

    beforeEach(() => {
        page.navigateTo(browser.baseUrl + "webupdates/modify/ripe/as-set/AS196613%253AAS-TEST");
    });

    it("should properly close the reason modal", async () => {
        await page.scrollIntoCenteredView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
    });

    it("should add remarks fields", async () => {
        await page.scrollIntoCenteredView(page.btnAddAttribute);
        expect(page.inpRemarks.isPresent()).toEqual(false);
        page.btnAddAttribute.click();
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.selectFromList(page.modalAttributeList, "remarks").isPresent()).toEqual(true);
        page.selectFromList(page.modalAttributeList, "remarks").click();
        page.modalBtnSubmit.click();
        expect(page.inpRemarks.isPresent()).toEqual(true);
        await waitToBeClickable(page.btn2ndAddAttribute);
        page.btn2ndAddAttribute.click();
        expect(page.modal.isPresent()).toEqual(true);
        page.selectFromList(page.modalAttributeList, "remarks").click();
        page.modalBtnSubmit.click();
        expect(page.remarks1stPosition.getText()).toEqual("remarks");
        expect(page.remarks2ndPosition.getText()).toEqual("remarks");
    });

});
