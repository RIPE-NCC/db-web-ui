/*
 * This weird test in every it overriding default user json file with other json file - user which contain different
 * privileges (roles).
 * On this way we are able to test if left hand menu contains expected structure of menu items,
 * because for different role is different content in menu.
 */
import { MenuPage } from '../pages/menu.page';

describe('The left hand menu structure depend on logged in user role', () => {
    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';
    const enduser = './test/e2e/mocks/e2eTest/end-user.json';
    const userWithBillingRole = './test/e2e/mocks/e2eTest/user-with-billing-role.json';
    const userWithoutOrgOrLir = './test/e2e/mocks/e2eTest/user-without-org-or-lir.json';
    const userNotLoggedIn = './test/e2e/mocks/e2eTest/user-not-logged-in.json';
    const userGuest = './test/e2e/mocks/e2eTest/user-with-guest-role.json';

    const menuPage = new MenuPage();

    after(() => {
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
    });

    /* RIPE Database structure of menu items
          Query Database
          Full Text Search
          Syncupdates
          Create an Object
    */
    const expectRipeDatabaseMenuItemWithAllSubItems = () => {
        menuPage
            .openTopLevelMenu('LOCAL Database')
            .expectSecondLevelMenuSize('LOCAL Database', 5)
            .expectSecondLevelTitleToBe('LOCAL Database', 0, 'Query Database')
            .expectSecondLevelTitleToBe('LOCAL Database', 1, 'Full Text Search')
            .expectSecondLevelTitleToBe('LOCAL Database', 2, 'Syncupdates')
            .expectSecondLevelTitleToBe('LOCAL Database', 3, 'Create an Object')
            .expectSecondLevelTitleToBe('LOCAL Database', 4, 'API Keys');
    };

    const expectRipeDatabaseMenuItemWithoutApiKeysItem = () => {
        menuPage
            .openTopLevelMenu('LOCAL Database')
            .expectSecondLevelMenuSize('LOCAL Database', 4)
            .expectSecondLevelTitleToBe('LOCAL Database', 0, 'Query Database')
            .expectSecondLevelTitleToBe('LOCAL Database', 1, 'Full Text Search')
            .expectSecondLevelTitleToBe('LOCAL Database', 2, 'Syncupdates')
            .expectSecondLevelTitleToBe('LOCAL Database', 3, 'Create an Object');
    };

    it('should not show Sponsored Resources for End Users', () => {
        cy.changeJsonResponseFile(enduser, userInfoFile);
        cy.visit('');
        menuPage
            .expectTopMenuSize(4)
            .expectTopMenuTitleToBe(0, 'Requests')
            .expectTopMenuTitleToBe(1, 'Resources')
            .expectTopMenuTitleToBe(2, 'LOCAL Database')
            .expectTopMenuTitleToBe(3, 'RPKI')
            .openTopLevelMenu('Resources')
            /* My Resource structure of menu items
                My Resources
            */
            .expectSecondLevelMenuSize('Resources', 1)
            .expectSecondLevelTitleToBe('Resources', 0, 'My Resources');
    });

    it('should show menu structure for user with billing role', () => {
        cy.changeJsonResponseFile(userWithBillingRole, userInfoFile);
        cy.visit('');
        menuPage
            .expectTopMenuSize(4)
            .expectTopMenuTitleToBe(0, 'My LIR')
            .expectTopMenuTitleToBe(1, 'Requests')
            .expectTopMenuTitleToBe(2, 'Resources')
            .expectTopMenuTitleToBe(3, 'LOCAL Database')
            /* My Resource structure of menu items
                My Resources
                Sponsored Resources
             */
            .openTopLevelMenu('Resources')
            .expectSecondLevelMenuSize('Resources', 2)
            .expectSecondLevelTitleToBe('Resources', 0, 'My Resources')
            .expectSecondLevelTitleToBe('Resources', 1, 'Sponsored Resources');

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('should show menu structure for user without org or lir', () => {
        cy.changeJsonResponseFile(userWithoutOrgOrLir, userInfoFile);
        cy.visit('');
        menuPage
            .expectTopMenuSize(2)
            .expectTopMenuTitleToBe(0, 'Resources')
            .expectTopMenuSubTitleToBe(0, 'My Resources, Sponsored Resources')
            .expectTopMenuTitleToBe(1, 'LOCAL Database')
            /* My Resource structure is empty */
            .expectSecondLevelMenuSize('Resources', 0);

        expectRipeDatabaseMenuItemWithoutApiKeysItem();
    });

    it('should show menu structure for no logged in user', () => {
        cy.changeJsonResponseFile(userNotLoggedIn, userInfoFile);
        cy.visit('');
        menuPage
            .expectTopMenuSize(2)
            .expectTopMenuTitleToBe(0, 'Resources')
            .expectTopMenuSubTitleToBe(0, 'My Resources, Sponsored Resources')
            .expectTopMenuTitleToBe(1, 'LOCAL Database')
            /* My Resource structure is empty */
            .expectSecondLevelMenuSize('Resources', 0);
        expectRipeDatabaseMenuItemWithoutApiKeysItem();
    });

    it('should show menu structure for a guest user', () => {
        cy.changeJsonResponseFile(userGuest, userInfoFile);
        cy.visit('');
        menuPage.expectTopMenuSize(2).expectTopMenuTitleToBe(0, 'My LIR').expectTopMenuTitleToBe(1, 'LOCAL Database');
        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('should show menu structure for user with all role', () => {
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
        cy.visit('');
        menuPage
            .expectTopMenuSize(5)
            .expectTopMenuTitleToBe(0, 'My LIR')
            .expectTopMenuTitleToBe(1, 'Requests')
            .expectTopMenuTitleToBe(2, 'Resources')
            .expectTopMenuTitleToBe(3, 'LOCAL Database')
            .expectTopMenuTitleToBe(4, 'RPKI')
            /* My Resource structure of menu items
                My Resources
                Sponsored Resources (only for LIR organisations selected in dropdown)
             */
            .openTopLevelMenu('Resources')
            .expectSecondLevelMenuSize('Resources', 2)
            .expectSecondLevelTitleToBe('Resources', 0, 'My Resources')
            .expectSecondLevelTitleToBe('Resources', 1, 'Sponsored Resources');

        expectRipeDatabaseMenuItemWithAllSubItems();
    });
});
