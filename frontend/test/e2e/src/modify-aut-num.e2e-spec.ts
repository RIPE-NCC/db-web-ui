import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying an aut-num", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "#/webupdates/modify/RIPE/aut-num/AS12467");
    });

    describe("which DOES NOT have status APPROVED PI", () => {

        it("should show sponsoring-org as read-only", () => {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            expect(page.inpSponsoringOrg.getAttribute("disabled")).toBeFalsy();
        });

        it("should not allow sponsoring-org to be added", () => {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            page.scrollIntoView(page.btnAddAttribute);
            page.btnAddAttribute.click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, "descr").isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, "sponsoring-org").isPresent()).toEqual(false);
        });

    });

});
