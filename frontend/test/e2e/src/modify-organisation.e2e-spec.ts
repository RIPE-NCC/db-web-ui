import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying an organisation", () => {

    describe("which is an LIR", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "webupdates/modify/RIPE/organisation/ORG-AGNS1-RIPE");
        });

        it("should show the mnt-by field as read-only", () => {
            expect(page.inpMaintainer.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute("ng-reflect-is-disabled")).toBeTruthy();
        });

        it("should show the remarks field starting with hash (#)", () => {
            expect(page.inpRemarks.isPresent()).toEqual(true);
            expect(page.inpRemarks.getAttribute("value")).toEqual("# comment");
        });

        it("should show comment behind value starting with hash (#)", () => {
            expect(page.inpAddress.isPresent()).toEqual(true);
            expect(page.inpAddress.getAttribute("value")).toEqual("Wilhelmina van Pruisenweg 106 # office");
        });

        it("should contain pencil button next to org-name, address, phone, fax-no, email in case of LIR organisation", () => {
            expect(page.btnEditAnAttribute(page.inpOrgName).isPresent()).toEqual(true);
            expect(page.btnEditAnAttribute(page.inpAddress).isPresent()).toEqual(true);
            expect(page.btnEditAnAttribute(page.inpPhone).isPresent()).toEqual(true);
            expect(page.btnEditAnAttribute(page.inpFax).isPresent()).toEqual(true);
            expect(page.btnEditAnAttribute(page.inpEmail).isPresent()).toEqual(true);
        });

        it("should not allow address to be added - should not have in list of options", () => {
            page.scrollIntoView(page.btnAddAttribute);
            expect(page.inpAddress.isPresent()).toEqual(true);
            page.btnAddAttribute.click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalAddress.isPresent()).toEqual(false);
            expect(page.selectFromList(page.modalAttributeList, "address").isPresent()).toEqual(false);
        });

        it("should open modal edit attribute on click on pen button org-name", () => {
            page.scrollIntoView(page.btnEditAnAttribute(page.inpOrgName));
            page.btnEditAnAttribute(page.inpOrgName).click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalHeader.getText()).toEqual("Updating legal information");
            expect(page.modalEditAttrPanel1.getText()).toContain("My organisation\'s legal name has changed; no other legal entity is involved");
            expect(page.modalEditAttrPanel2.getText()).toContain("The business structure of my organisation has changed (for example due to a merger or acquisition)");
        });

        it("should open modal edit attribute on click on pen button address", () => {
            page.scrollIntoView(page.inpAddress);
            page.btnEditAnAttribute(page.inpAddress).click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalHeader.getText()).toEqual("Updating address information");
            expect(page.modalEditAttrPanel1.getText()).toContain("My organisation\'s legal address has changed");
            expect(page.modalEditAttrPanel2.getText()).toContain("My organisation\'s postal address has changed");
        });

        it("should open modal edit attribute on click on pen button contact information", () => {
            page.scrollIntoView(page.inpPhone);
            page.btnEditAnAttribute(page.inpPhone).click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalHeader.getText()).toEqual("Updating contact information");
            expect(page.modalEditAttrPanel1.getText()).toContain("My organisation\'s telephone number has changed");
            page.modalClose.click();
            page.scrollIntoView(page.inpFax);
            page.btnEditAnAttribute(page.inpFax).click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalHeader.getText()).toEqual("Updating contact information");
            expect(page.modalEditAttrPanel1.getText()).toContain("My organisation\'s fax number has changed");
            page.modalClose.click();
            page.scrollIntoView(page.inpEmail);
            page.btnEditAnAttribute(page.inpEmail).click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalHeader.getText()).toEqual("Updating contact information");
            expect(page.modalEditAttrPanel1.getText()).toContain("My organisation\'s email address has changed");
            page.modalClose.click();
        });

        it("should not contain remove (trush) button next to abuse-c in case of LIR organisation", () => {
            page.scrollIntoView(page.inpAbuseC);
            expect(page.btnRemoveAttributeCreatModifyPage(page.inpAbuseC).isPresent()).toBeFalsy();
        });

        it("should not have country field in case there is not specified country attribute", () => {
            expect(page.inpCountry.isPresent()).toBeFalsy();
        });
    });

    describe("which is an OTHER type", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "webupdates/modify/ripe/organisation/ORG-ADNL2-RIPE");
        });

        it("should contain remove (trush) button next to abuse-c in case of LIR organisation", () => {
            page.scrollIntoView(page.inpAbuseC);
            expect(page.btnRemoveAttributeCreatModifyPage(page.inpAbuseC).isPresent()).toBeTruthy();
        });

        it("should remove comment after address change and comment was removed", () => {
            expect(page.inpAddress.getAttribute("value")).toEqual("7465 Mission George Road San Diego, CA92120 # comment address");
            page.inpAddress.clear();
            page.inpAddress.sendKeys("New address without comment");
            expect(page.inpAddress.getAttribute("value")).toEqual("New address without comment");
            expect(page.inpAddress.getAttribute("value")).not.toContain("#");
        });

        it("should have disabled country field", () => {
            expect(page.inpCountry.getAttribute("ng-reflect-model")).toEqual("NL");
            expect(page.inpCountry.getAttribute("ng-reflect-is-disabled")).toBeTruthy();
        });

        it("should not have country attribute in modal-add-attribute", () => {
            page.btnAddAttribute.click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.modalCountry.isPresent()).toEqual(false);
            expect(page.selectFromList(page.modalAttributeList, "country").isPresent()).toEqual(false);
        });
    });
});
