import { QueryPage } from '../pages/query.page';

describe('Session expire', () => {
    const queryPage = new QueryPage();
    const userNotLoggedIn = './test/e2e/mocks/e2eTest/user-not-logged-in.json';
    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';

    afterEach(() => {
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
    });

    it('should show the banner when the user is logged and the session is expired', () => {
        // we can't use prism to intercept calls to other domains
        cy.intercept('GET', 'https://access.prepdev.ripe.net/user/profile', { statusCode: 200, body: {} }).as('getProfile');
        cy.intercept('GET', 'https://access.ripe.net/user/profile', { statusCode: 200, body: {} });
        cy.setCookie('crowd.ripe.hint', 'true');
        queryPage.visit();
        cy.wait('@getProfile');
        cy.changeJsonResponseFile(userNotLoggedIn, userInfoFile);
        cy.wait('@getProfile');
        cy.intercept('GET', /https:\/\/localhost(.ripe.net)?:9002\/db-web-ui\/api\/whois-internal\/api\/user\/info/).as('getUserInfo');
        cy.wait('@getUserInfo');
        queryPage.expectUserLoggedImage(false).expectErrorMessageToContain('Your RIPE NCC Access session has expired. You need to login again.');
    });

    it('should show logged out icon if the user is not logged', () => {
        // we can't use prism to intercept calls to other domains
        cy.intercept('GET', 'https://access.prepdev.ripe.net/user/profile', { statusCode: 401 }).as('getProfile');
        cy.intercept('GET', 'https://access.ripe.net/user/profile', { statusCode: 401 });
        cy.setCookie('crowd.ripe.hint', 'true');
        queryPage.visit();
        cy.wait('@getProfile');
        cy.intercept('GET', /https:\/\/localhost(.ripe.net)?:9002\/db-web-ui\/api\/whois-internal\/api\/user\/info/).as('getUserInfo');
        cy.wait('@getUserInfo');
        queryPage.expectUserLoggedImage(false);
    });

    it('should show the logged icon if the user is logged', () => {
        // we can't use prism to intercept calls to other domains
        cy.intercept('GET', 'https://access.prepdev.ripe.net/user/profile', { statusCode: 200, body: {} }).as('getProfile');
        cy.intercept('GET', 'https://access.ripe.net/user/profile', { statusCode: 200, body: {} });
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
        cy.setCookie('crowd.ripe.hint', 'true');
        queryPage.visit();
        cy.wait('@getProfile');
        cy.intercept('GET', /https:\/\/localhost(.ripe.net)?:9002\/db-web-ui\/api\/whois-internal\/api\/user\/info/).as('getUserInfo');
        cy.wait('@getUserInfo');
        queryPage.expectUserLoggedImage(true);
    });
});
