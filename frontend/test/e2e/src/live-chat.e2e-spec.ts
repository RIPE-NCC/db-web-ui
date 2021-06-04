import {browser} from "protractor";

const page = require("./homePageObject");
// TODO need to be ignored until RS is not capable to provide support for live chat
xdescribe("live-chat", () => {

    beforeEach(() => {
        browser.get(`${browser.baseUrl}"query"`);
    });

    it("should exist live-chat angular component on init", () => {
        let hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: 'Europe/Amsterdam' }).split(':').map(x => parseInt(x))
        let currentDay = new Date().toLocaleDateString("en-GB", { timeZone: 'Europe/Amsterdam', weekday: 'long' })
        // don't show for weekends
        let isWeekend = currentDay === "Saturday" || currentDay === "Sunday"

        // doesn't show before 9h and after 18h
        if (hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18 && !isWeekend) {
            expect(page.liveChatButton.isDisplayed()).toEqual(true);
        }
    });

    it("should disappear live-chat project component after click on live-chat button", () => {
        let hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: 'Europe/Amsterdam' }).split(':').map(x => parseInt(x))
        let currentDay = new Date().toLocaleDateString("en-GB", { timeZone: 'Europe/Amsterdam', weekday: 'long' })
        // don't show for weekends
        let isWeekend = currentDay === "Saturday" || currentDay === "Sunday"

        // doesn't show before 9h and after 18h
        if (hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18 && !isWeekend) {
            page.liveChatButton.click();
            expect(page.liveChatButton.isDisplayed()).toEqual(false);
        }
    });

});
