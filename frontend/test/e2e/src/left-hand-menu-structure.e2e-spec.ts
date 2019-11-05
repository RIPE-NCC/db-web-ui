// Local requires
import {browser, by} from "protractor";

const page = require("./homePageObject");
const fs = require("fs");

/*
 * This weird test in every it overriding default user json file with other json file - user which contain different
 * privileges (roles).
 * On this way we are able to test if left hand menu containts expected structure of menu items,
 * because for different role is different content in menu.
 */
describe("The left hand menu structure depend on logged in user role", () => {

    const userInfoFile = "./test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json";
    const userWithAllRoles = "./test/e2e/mocks/e2eTest/user-with-all-role.json";
    const userWithBillingRole = "./test/e2e/mocks/e2eTest/user-with-billing-role.json";
    const userWithoutOrgOrLir = "./test/e2e/mocks/e2eTest/user-without-org-or-lir.json";
    const userNotLoggedIn = "./test/e2e/mocks/e2eTest/user-not-logged-in.json";
    const userGuest = "./test/e2e/mocks/e2eTest/user-with-guest-role.json";

    const changeJsonResponsFile = (file, replacement) => {
        fs.readFile(replacement, "utf8", (err, data) => {
            if (err) {
                return console.log(err);
            }
            fs.writeFile(file, data, "utf8", (err) => {
                if (err) return console.log(err);
            });
        });
    };

    /* RIPE Database structure of menu items
        Query the RIPE Database
        Full Text Search
        Syncupdates
        Create an Object
     */
    const expectRipeDatabaseMenuItemWithAllSubItems = () => {
        page.topMenuItems.get(2).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("RIPE Database");
        });
        page.topMenuItems.get(2).click();
        expect(page.topMenuItems.get(2).all(by.css(".level2 li")).count()).toEqual(4);
        page.ripeDatabaseMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Query the RIPE Database");
        });
        page.ripeDatabaseMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Full Text Search");
        });
        page.ripeDatabaseMenuItems.get(2).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Syncupdates");
        });
        page.ripeDatabaseMenuItems.get(3).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Create an Object");
        });
    };

    afterAll(() => {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
    });

    it("should show menu structure for user with all role", () => {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("My Account");
        });
        page.topMenuItems.get(1).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("Resources");
        });

        /* My Account structure of menu items
            Account Overview
            Billing
            Request Update
            Users
            Tickets
            Training
            API Keys
            General Meeting
         */
        page.scrollIntoView(page.topMenuItems.get(0));
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        page.myLirMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Account Overview");
        });
        page.myLirMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Billing");
        });
        page.myLirMenuItems.get(2).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Request Update");
        });
        page.myLirMenuItems.get(3).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Users");
        });
        page.myLirMenuItems.get(4).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Tickets");
        });
        page.myLirMenuItems.get(5).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Training");
        });
        page.myLirMenuItems.get(6).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("API Keys");
        });
        page.myLirMenuItems.get(7).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("General Meeting");
        });

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
            Request Resources
            Request Transfer
            IPv4 Transfer Listing Service
            RPKI Dashboard
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(6);
        page.resourcesMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.resourcesMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        page.resourcesMenuItems.get(2).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Request Resources");
        });
        page.resourcesMenuItems.get(3).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Request Transfer");
        });
        page.resourcesMenuItems.get(4).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("IPv4 Transfer Listing Service");
        });
        page.resourcesMenuItems.get(5).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("RPKI Dashboard");
        });

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("should show menu structure for user with billing role", () => {
        changeJsonResponsFile(userInfoFile, userWithBillingRole);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("My Account");
        });
        page.topMenuItems.get(1).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("Resources");
        });

        /* My Account structure of menu items
            Billing
            Users
         */
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        expect(page.myLirMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.myLirMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(3).isDisplayed()).toEqual(true);
        expect(page.myLirMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(5).isDisplayed()).toEqual(false);
        page.myLirMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Billing");
        });
        page.myLirMenuItems.get(3).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Users");
        });

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(6);
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(5).isDisplayed()).toEqual(false);
        page.resourcesMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.resourcesMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("should show menu structure for user without org or lir", () => {
        changeJsonResponsFile(userInfoFile, userWithoutOrgOrLir);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(1).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("Resources");
        });

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(6);
        page.resourcesMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.resourcesMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(5).isDisplayed()).toEqual(false);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("should show menu structure for no logged in user", () => {
        changeJsonResponsFile(userInfoFile, userNotLoggedIn);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(1).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("Resources");
        });

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(6);
        page.resourcesMenuItems.get(0).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.resourcesMenuItems.get(1).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(5).isDisplayed()).toEqual(false);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("Should show menu structure for a guest user", () => {
        changeJsonResponsFile(userInfoFile, userGuest);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css("a")).first().getText().then((text) => {
            expect(text).toBe("My Account");
        });

        /* Resource structure of menu items
            My LIR
         */
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        page.myLirMenuItems.get(8).element(by.css("a")).getText().then((text) => {
            expect(text).toBe("Request Update");
        });
        expect(page.myLirMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(5).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(6).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(7).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(8).isDisplayed()).toEqual(true);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

});
