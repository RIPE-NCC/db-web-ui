// Local requires
const page = require("./homePageObject");

describe("The user info component", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "#/fulltextsearch");
    });

    it("should redirect to query page after Logout", () => {
        expect(page.userInfoMenu.isDisplayed()).toEqual(false);
        expect(page.userInfo.isPresent()).toEqual(true);
        page.userInfo.click();
        expect(page.userInfoMenu.isDisplayed()).toEqual(true);

        expect(page.userInfoLogoutLink.getAttribute("href")).toContain("https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/#query");
    });

});
