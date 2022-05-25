// Local requires
import { browser, by, protractor } from 'protractor';

const page = require('./homePageObject');
const fs = require('fs').promises;

/*
 * This weird test in every it overriding default user json file with other json file - user which contain different
 * privileges (roles).
 * On this way we are able to test if left hand menu contains expected structure of menu items,
 * because for different role is different content in menu.
 */
describe('The left hand menu structure depend on logged in user role', () => {
    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';
    const enduser = './test/e2e/mocks/e2eTest/end-user.json';
    const userWithBillingRole = './test/e2e/mocks/e2eTest/user-with-billing-role.json';
    const userWithoutOrgOrLir = './test/e2e/mocks/e2eTest/user-without-org-or-lir.json';
    const userNotLoggedIn = './test/e2e/mocks/e2eTest/user-not-logged-in.json';
    const userGuest = './test/e2e/mocks/e2eTest/user-with-guest-role.json';
    const EC = protractor.ExpectedConditions;

    // protractor won't wait for non-angular components
    // we have to force the wait manually
    const waitAndClick = async (element) => {
        await browser.wait(EC.elementToBeClickable(element), 5000, `timeout waiting for [${element.locator()}]`);
        await element.click();
        // wait until css transition is over
        await browser.sleep(1000);
    };

    const waitForCount = async (elements, amount) => {
        await browser.wait(() => elements.count().then((c) => c === amount), 50000);
    };

    const changeJsonResponseFile = async (file, replacement) => {
        const data = await fs.readFile(replacement, { encoding: 'utf8' });
        await fs.writeFile(file, data, { encoding: 'utf8' });
    };

    /* RIPE Database structure of menu items
        Query the RIPE Database
        Full Text Search
        Syncupdates
        Create an Object
     */
    const expectRipeDatabaseMenuItemWithAllSubItems = async () => {
        page.topMenuItems
            .get(3)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RIPE Database');
            });
        await waitAndClick(page.ripeDatabaseMenuItem);
        await waitForCount(page.ripeDatabaseMenuItems, 4);
        expect(page.ripeDatabaseMenuItems.count()).toEqual(4);
        page.ripeDatabaseMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Query the RIPE Database');
            });
        page.ripeDatabaseMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Full Text Search');
            });
        page.ripeDatabaseMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Syncupdates');
            });
        page.ripeDatabaseMenuItems
            .get(3)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Create an Object');
            });
    };

    afterAll(async () => {
        await changeJsonResponseFile(userInfoFile, userWithAllRoles);
    });

    it('should not show Sponsored Resources for End Users', async () => {
        await changeJsonResponseFile(userInfoFile, enduser);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 4);
        expect(page.topMenuItems.count()).toEqual(4);
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Resources');
            });
        page.topMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RIPE Database');
            });
        /* Resources structure of menu items
            My Resources
            Sponsored Resources
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondTopMenuItems, 1);
        expect(page.secondTopMenuItems.count()).toEqual(1);
        page.secondTopMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My Resources');
            });
        await waitAndClick(page.topMenuItems.get(1));
    });

    it('should show menu structure for user with billing role', async () => {
        await changeJsonResponseFile(userInfoFile, userWithBillingRole);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 4);
        expect(page.topMenuItems.count()).toEqual(4);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(3).isDisplayed()).toEqual(true);
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My LIR');
            });
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Requests');
            });
        page.topMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Resources');
            });

        /* My Resource structure of menu items
            My Resources
            Sponsored Resources
         */
        await waitAndClick(page.topMenuItems.get(2));
        await waitForCount(page.myResourcesMenuItems, 2);
        expect(page.myResourcesMenuItems.count()).toEqual(2);
        page.myResourcesMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My Resources');
            });
        page.myResourcesMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Sponsored Resources');
            });
        await waitAndClick(page.topMenuItems.get(2));

        await expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('should show menu structure for user without org or lir', async () => {
        await changeJsonResponseFile(userInfoFile, userWithoutOrgOrLir);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Resources');
            });
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.subtitle'))
            .getText()
            .then((text) => {
                expect(text).toBe('My Resources, Sponsored Resources');
            });
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RIPE Database');
            });
        /* My Resource structure is empty */
        expect(page.firstTopMenuItems.count()).toEqual(0);

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondTopMenuItems, 4);
        expect(page.secondTopMenuItems.count()).toEqual(4);
        page.secondTopMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Query the RIPE Database');
            });
        page.secondTopMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Full Text Search');
            });
        page.secondTopMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Syncupdates');
            });
        page.secondTopMenuItems
            .get(3)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Create an Object');
            });
    });

    it('should show menu structure for no logged in user', async () => {
        await changeJsonResponseFile(userInfoFile, userNotLoggedIn);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Resources');
            });
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.subtitle'))
            .getText()
            .then((text) => {
                expect(text).toBe('My Resources, Sponsored Resources');
            });
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RIPE Database');
            });

        /* Resources menu item is empty */
        expect(page.firstTopMenuItems.count()).toEqual(0);

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondTopMenuItems, 4);
        expect(page.secondTopMenuItems.count()).toEqual(4);
        page.secondTopMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Query the RIPE Database');
            });
        page.secondTopMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Full Text Search');
            });
        page.secondTopMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Syncupdates');
            });
        page.secondTopMenuItems
            .get(3)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Create an Object');
            });
    });

    it('should show menu structure for a guest user', async () => {
        await changeJsonResponseFile(userInfoFile, userGuest);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 2);
        expect(page.topMenuItems.count()).toEqual(2);
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My LIR');
            });
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RIPE Database');
            });

        /* RIPE Database structure of menu items
            Query the RIPE Database
            Full Text Search
            Syncupdates
            Create an Object
         */
        await waitAndClick(page.topMenuItems.get(1));
        await waitForCount(page.secondTopMenuItems, 4);
        expect(page.secondTopMenuItems.count()).toEqual(4);
        page.secondTopMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Query the RIPE Database');
            });
        page.secondTopMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Full Text Search');
            });
        page.secondTopMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Syncupdates');
            });
        page.secondTopMenuItems
            .get(3)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Create an Object');
            });
    });

    it('should show menu structure for user with all role', async () => {
        await changeJsonResponseFile(userInfoFile, userWithAllRoles);
        page.navigateTo(browser.baseUrl);
        await waitForCount(page.topMenuItems, 5);
        expect(page.topMenuItems.count()).toEqual(5);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(3).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(4).isDisplayed()).toEqual(true);
        page.topMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My LIR');
            });
        page.topMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Requests');
            });
        page.topMenuItems
            .get(2)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Resources');
            });
        page.topMenuItems
            .get(4)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('RPKI');
            });

        /* My Account structure of menu items doesn't exist
         * on click on My Account redirect straight to LIR Portal
         */

        /* My Resource structure of menu items
            My Resources
            Sponsored Resources (only for LIR organisations selected in dropdown)
         */
        await waitAndClick(page.getMyResourcesTopMenu());
        await waitForCount(page.myResourcesMenuItems, 2);
        expect(page.myResourcesMenuItems.count()).toEqual(2);
        page.myResourcesMenuItems
            .get(0)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('My Resources');
            });
        page.myResourcesMenuItems
            .get(1)
            .element(by.css_sr('::sr p.title'))
            .getText()
            .then((text) => {
                expect(text).toBe('Sponsored Resources');
            });

        await waitAndClick(page.getMyResourcesTopMenu());

        await expectRipeDatabaseMenuItemWithAllSubItems();
    });
});
