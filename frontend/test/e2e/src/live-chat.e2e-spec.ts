import {browser} from "protractor";
import {waitToBeClickable} from "./fixtures";

const page = require("./homePageObject");
describe("live-chat", () => {

    beforeEach(async () => {
        await browser.manage().deleteAllCookies();
        browser.get(`${browser.baseUrl}query`);
    });

    const isLiveChatEnabled = () => {
        const hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Amsterdam" }).split(":").map(x => parseInt(x))
        const currentDay = new Date().toLocaleDateString("en-GB", { timeZone: "Europe/Amsterdam", weekday: "long" })
        // don't show for weekends
        const isWeekend = currentDay === "Saturday" || currentDay === "Sunday"

        // doesn't show before 9h and after 18h
        // return (hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18 && !isWeekend);
        return true;
    }

    it("should exist live-chat angular component", () => {
        if (isLiveChatEnabled()) {
            expect(page.liveChat.isDisplayed()).toEqual(true);
        }
    });

    // cookie is to keep live-chat chat window open between applications
    // User will have to click again as we cannot load script on page load
    xit("should stay open if I open and page is refreshed", async () => {
        if (isLiveChatEnabled()) {
            // open live chat
            await waitToBeClickable(page.liveChat);
            page.liveChat.click();
            await waitToBeClickable(page.liveChatWindow);
            expect(page.liveChatWindow.isDisplayed()).toEqual(true);
            // refresh page
            browser.refresh();
            // live chat is visible
            await waitToBeClickable(page.liveChatWindow);
            expect(page.liveChatWindow.isDisplayed()).toEqual(true);
        }
    });

    xit("should stay close if I close and page is refreshed", async () => {
      if (isLiveChatEnabled()) {
        // open live chat
        await waitToBeClickable(page.liveChat);
        page.liveChat.click();
        await waitToBeClickable(page.liveChatWindow);
        expect(page.liveChatWindow.isDisplayed()).toEqual(true);

        // refresh
        browser.refresh();
        await waitToBeClickable(page.liveChat);
        expect(page.liveChatWindow.isPresent()).toEqual(false);
      }

    });
});
