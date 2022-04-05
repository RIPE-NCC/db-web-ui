import {browser} from "protractor";

const page = require("./homePageObject");

describe("Modifying an inet6num", () => {

    describe("which is an allocation", () => {

        beforeEach(() => {
            page.navigateTo(browser.baseUrl + "webupdates/modify/RIPE/inet6num/2001:999:2000::%2F36");
            expect(page.modalBtnSubmit.isPresent()).toEqual(true);
            expect(page.modalInpMaintainer.getText()).toEqual("XS4ALL-MNT");
            page.modalInpAssociate.click();
            page.modalInpPassword.sendKeys("XS4ALL-MNT");
            page.modalBtnSubmit.click();
        });

        it("should show input controls in the correct disabled or enabled state", () => {
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute("class")).toContain("ng-select-disabled");
            expect(page.inpMntnerBox.getText()).toContain("XS4ALL-MNT");
            expect(page.inpMntnerBox.getText()).toContain("RIPE-NCC-HM-MNT");
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute("disabled")).toBeTruthy();
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute("disabled")).toBeTruthy();
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });

    });

    describe("which is an assignment", () => {

        beforeEach(() => {
            page.navigateTo(browser.baseUrl + "webupdates/modify/RIPE/inet6num/2001:998:2000::%2F36");
            expect(page.modalBtnSubmit.isPresent()).toEqual(true);
            expect(page.modalInpMaintainer.getText()).toEqual("XS4ALL-MNT");
            page.modalInpAssociate.click();
            page.modalInpPassword.sendKeys("XS4ALL-MNT");
            page.modalBtnSubmit.click();
        });

        it("should show input controls in the correct disabled or enabled state", function() {
            // maintainer input is enabled
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute("class")).not.toContain("ng-select-disabled");
            expect(page.inpMntnerBox.getText()).toContain("XS4ALL-MNT");
            expect(page.inpMntnerBox.getText()).toContain("RIPE-NCC-END-MNT");
            // should NOT show netname as read-only
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute("disabled")).toBeFalsy();
            // should show assignment-size as read-only
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute("disabled")).toBeTruthy();
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });
    });

    describe("which is an allocated by lir", () => {

        beforeEach(() => {
            page.navigateTo(browser.baseUrl + "webupdates/modify/RIPE/inet6num/2002:998:2000::%2F36");
            expect(page.modalBtnSubmit.isPresent()).toEqual(true);
            expect(page.modalInpMaintainer.getText()).toEqual("XS4ALL-MNT");
            page.modalInpAssociate.click();
            page.modalInpPassword.sendKeys("XS4ALL-MNT");
            page.modalBtnSubmit.click();
        });

        it("should show delete btn", () => {
            expect(page.inpMntnerBox.getText()).toBe("XS4ALL-MNT");
            expect(page.btnDeleteObject.isPresent()).toEqual(true);
        });
    });
});

