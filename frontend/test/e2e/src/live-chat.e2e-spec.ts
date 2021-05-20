import {browser} from "protractor";

const page = require("./homePageObject");

describe("live-chat", () => {

    beforeEach(() => {
        browser.get(`${browser.baseUrl}"query"`);
    });

    it("should exist live-chat angular component on init", () => {
        let hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: 'Europe/Amsterdam' }).split(':').map(x => parseInt(x))
        // doesn't show before 9h and after 18h
        if (hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18) {
            expect(page.liveChatButton.isDisplayed()).toEqual(true);
        }
    });

    it("should disappear live-chat project component after click on live-chat button", () => {
        let hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: 'Europe/Amsterdam' }).split(':').map(x => parseInt(x))
        // doesn't show before 9h and after 18h
        if (hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18) {
            page.liveChatButton.click();
            expect(page.liveChatButton.isDisplayed()).toEqual(false);
        }
    });

});
