// Local requires
import {browser, by, protractor} from "protractor";

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
    const EC = protractor.ExpectedConditions;

    // protractor won't wait for non-angular components
    // we have to force the wait manually
    const waitAndClick = async (element) => {
        await browser.wait(EC.elementToBeClickable(element), 5000, `timeout waiting for [${element.locator()}]`);
        // const capabilities = await browser.getCapabilities();
        // const browserName = capabilities.get("browserName").toLowerCase();
        // // firefox can't move mouse: https://github.com/angular/protractor/issues/5346
        // if (browserName.includes("firefox")) {
        //     await element.click();
        // } else {
        //     await clickOnTop(element);
        // }
        await element.click();
        // wait until css transition is over
        await browser.sleep(1000)
    }

    const clickOnTop = async (element) => {
        const size = await element.getSize();
        const x = size.width / 2;
        const y = 5;
        await browser.actions()
            .mouseMove(element, {x, y})
            .click()
            .perform();
    }

    const waitForCount = async (elements, amount) => {
        await browser.wait(() => elements.count().then((c)=> c === amount), 5000);
    }

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
    const expectRipeDatabaseMenuItemWithAllSubItems = async () => {
        page.topMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("RIPE Database");
        });
        await waitAndClick(page.ripeDatabaseMenuItem);
        await waitForCount(page.ripeDatabaseMenuItems, 4);
        expect(page.ripeDatabaseMenuItems.count()).toEqual(4);
        page.ripeDatabaseMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Query the RIPE Database");
        });
        page.ripeDatabaseMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Full Text Search");
        });
        page.ripeDatabaseMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Syncupdates");
        });
        page.ripeDatabaseMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Create an Object");
        });
    };

    afterAll(() => {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
    });

    it("should show menu structure for user with all role", async () => {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
        browser.get(browser.baseUrl);
        await waitForCount(page.topMenuItems, 3);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Account");
        });
        page.topMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
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
        // page.scrollIntoView(page.topMenuItems.get(0));
        await waitAndClick(page.getMyAccountTopMenu());
        await waitForCount(page.firstMenuItems, 8);
        expect(page.firstMenuItems.count()).toEqual(8);
        page.firstMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Account Overview");
        });
        page.firstMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Billing");
        });
        page.firstMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Request Update");
        });
        page.firstMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Users");
        });
        page.firstMenuItems.get(4).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Tickets");
        });
        page.firstMenuItems.get(5).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Training");
        });
        page.firstMenuItems.get(6).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("API Keys");
        });
        page.firstMenuItems.get(7).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("General Meeting");
        });
        await waitAndClick(page.getMyAccountTopMenu());

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
            Request Resources
            Request Transfer
            IPv4 Transfer Listing Service
            RPKI Dashboard
         */
        await waitAndClick(page.getResourcesTopMenu());
        await waitForCount(page.secondMenuItems, 6);
        expect(page.secondMenuItems.count()).toEqual(6);
        page.secondMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.secondMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        page.secondMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Request Resources");
        });
        page.secondMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Request Transfer");
        });
        page.secondMenuItems.get(4).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("IPv4 Transfer Listing Service");
        });
        page.secondMenuItems.get(5).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("RPKI Dashboard");
        });
        await waitAndClick(page.getResourcesTopMenu());

        await expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("should show menu structure for user with billing role", async () => {
        changeJsonResponsFile(userInfoFile, userWithBillingRole);
        browser.get(browser.baseUrl);
        await waitForCount(page.topMenuItems, 3);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Account");
        });
        page.topMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Resources");
        });

        /* My Account structure of menu items
            Billing
            Users
         */
        await waitAndClick(page.topMenuItems.get(0));
        await waitForCount(page.firstMenuItems, 2);
        expect(page.firstMenuItems.count()).toEqual(2);
        page.firstMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Billing");
        });
        page.firstMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Users");
        });
        await waitAndClick(page.topMenuItems.get(0));


        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondMenuItems, 2);
        expect(page.secondMenuItems.count()).toEqual(2);
        page.secondMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.secondMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        await waitAndClick(page.topMenuItems.get(1));

        await expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it("should show menu structure for user without org or lir", async () => {
        changeJsonResponsFile(userInfoFile, userWithoutOrgOrLir);
        browser.get(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Resources");
        });
        page.topMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("RIPE Database");
        });
        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        await waitAndClick(page.topMenuItems.get(0));
        await waitForCount(page.firstMenuItems, 2);
        expect(page.firstMenuItems.count()).toEqual(2);
        page.firstMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.firstMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        await waitAndClick(page.topMenuItems.get(0));

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondMenuItems, 4);
        expect(page.secondMenuItems.count()).toEqual(4);
        page.secondMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Query the RIPE Database");
        });
        page.secondMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Full Text Search");
        });
        page.secondMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Syncupdates");
        });
        page.secondMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Create an Object");
        });
    });

    it("should show menu structure for no logged in user", async () => {
        changeJsonResponsFile(userInfoFile, userNotLoggedIn);
        browser.get(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Resources");
        });
        page.topMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("RIPE Database");
        });

        /* Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        await waitAndClick(page.topMenuItems.get(0));
        await waitForCount(page.firstMenuItems, 2);
        expect(page.firstMenuItems.count()).toEqual(2);
        page.firstMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Resources");
        });
        page.firstMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Sponsored Resources");
        });
        await waitAndClick(page.topMenuItems.get(0));

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondMenuItems, 4);
        expect(page.secondMenuItems.count()).toEqual(4);
        page.secondMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Query the RIPE Database");
        });
        page.secondMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Full Text Search");
        });
        page.secondMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Syncupdates");
        });
        page.secondMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Create an Object");
        });
    });

    it("should show menu structure for a guest user", async () => {
        changeJsonResponsFile(userInfoFile, userGuest);
        browser.get(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("My Account");
        });
        page.topMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("RIPE Database");
        });

        /* Resource structure of menu items
            My LIR
         */
        await waitAndClick(page.topMenuItems.get(0));
        await waitForCount(page.firstMenuItems, 1);
        expect(page.firstMenuItems.count()).toEqual(1);
        page.firstMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Request Update");
        });
        await waitAndClick(page.topMenuItems.get(0));

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondMenuItems, 4);
        expect(page.secondMenuItems.count()).toEqual(4);
        page.secondMenuItems.get(0).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Query the RIPE Database");
        });
        page.secondMenuItems.get(1).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Full Text Search");
        });
        page.secondMenuItems.get(2).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Syncupdates");
        });
        page.secondMenuItems.get(3).element(by.css_sr("::sr p.title")).getText().then((text) => {
            expect(text).toBe("Create an Object");
        });
    });

});
