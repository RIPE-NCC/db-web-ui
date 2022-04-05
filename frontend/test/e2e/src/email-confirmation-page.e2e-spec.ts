import {browser} from "protractor";

const page = require("./homePageObject");

describe("Email Confirmation Page", () => {

    it("should show successful validation page", () => {
        page.navigateTo(browser.baseUrl + "confirmEmail?t=SUCCESS-TOKEN");
        expect(page.checkImg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.getText()).toContain("Thank you! This email has now been validated. No further action is required.");
    });

    it("should show unsuccessful validation page", () => {
        page.navigateTo(browser.baseUrl + "confirmEmail?t=FAILED-TOKEN-EXPIRATION-DATE");
        expect(page.exclamationImg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.getText()).toContain("Sorry, this link is not valid anymore.");
    });
});
