import { QueryPage } from '../pages/query.page';
import { WebupdatesPage } from '../pages/webupdates.page';

describe('Session expire', () => {
    const queryPage = new QueryPage();
    const webupdatesPage = new WebupdatesPage();
    const personAuthError = './test/e2e/mocks/e2eTest/person-auth-error.json';
    const personCreation = './test/e2e/mocks/e2eTest/d7ae9b71eb48edb1ed1bb684fb8c615ac6f1c7ee.json';

    const userNotLoggedIn = './test/e2e/mocks/e2eTest/user-not-logged-in.json';
    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';

    afterEach(() => {
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
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

    it('should show the banner when the user is logged and the create request expire the cookie', () => {
        cy.intercept('GET', 'https://access.prepdev.ripe.net/user/profile', { statusCode: 200, body: {} }).as('getProfile');
        cy.intercept('GET', 'https://access.ripe.net/user/profile', { statusCode: 200, body: {} });
        cy.setCookie('crowd.ripe.hint', 'true');
        webupdatesPage.visit('select');
        cy.wait('@getProfile');
        cy.get('.modal-content').should('not.exist');
        webupdatesPage
            .selectObjectType('person')
            .clickOnCreateButton()
            .expectHeadingTitleToContain('Create "person" object')
            .typeOnField('person', 'Test t')
            .typeOnField('address', '123')
            .typeOnField('phone', '+44 123 123 123');
        cy.changeJsonResponseFile(personCreation, personAuthError);
        cy.clearCookie('crowd.ripe.hint');
        webupdatesPage.submitForm();
        webupdatesPage.expectErrorMessageToContain('Creation of person failed, please see below for more details');
        webupdatesPage.expectUserLoggedImage(false).expectErrorMessageToContain('Your RIPE NCC Access session has' + ' expired. You need to login again.');
    });

    it('should not show the banner when the user is logged and the create request doesnt expire the cookie', () => {
        cy.intercept('GET', 'https://access.prepdev.ripe.net/user/profile', { statusCode: 200, body: {} }).as('getProfile');
        cy.intercept('GET', 'https://access.ripe.net/user/profile', { statusCode: 200, body: {} });
        cy.setCookie('crowd.ripe.hint', 'true');
        webupdatesPage.visit('select');
        cy.wait('@getProfile');
        cy.get('.modal-content').should('not.exist');
        webupdatesPage
            .selectObjectType('person')
            .clickOnCreateButton()
            .expectHeadingTitleToContain('Create "person" object')
            .typeOnField('person', 'Test t')
            .typeOnField('address', '123')
            .typeOnField('phone', '+44 123 123 123');
        cy.changeJsonResponseFile(personCreation, personAuthError);

        webupdatesPage.submitForm();
        webupdatesPage.expectUserLoggedImage(true);
    });
});
