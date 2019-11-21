import {browser} from "protractor";

const page = require("./homePageObject");

describe("Deleting an as-set", () => {

    it("should properly close the reason modal", () => {
        browser.get(browser.baseUrl + "webupdates/modify/ripe/as-set/AS196613%253AAS-TEST");
        page.scrollIntoView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
    });

});
