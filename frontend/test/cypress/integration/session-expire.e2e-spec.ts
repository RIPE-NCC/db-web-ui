import { QueryPage } from '../pages/query.page';
import { WebupdatesPage } from '../pages/webupdates.page';

describe('Session expire', () => {
    const queryPage = new QueryPage();
    const webupdatesPage = new WebupdatesPage();
    const personAuthError = './test/e2e/mocks/e2eTest/person-auth-error.json';

    const mockProfile = {
        name: 'Big Wolf',
        email: 'test@ripe.net',
        username: 'Big Wolf',
        photo: 'test1234-1234-1234-abcd-test12345678',
    };

    const mockUnauthorizedProfile = {
        response: {
            status: 401,
            message: 'Unauthorized',
        },
    };

    it('should show logged out icon if the user is not logged', () => {
        cy.intercept('GET', 'db-web-ui/api/user-oidc/me', {
            statusCode: 401,
            body: mockUnauthorizedProfile,
        }).as('getProfile');

        cy.intercept('GET', '**/oauth2/authorization/keycloak**', (req) => {
            req.reply({ statusCode: 302, headers: { Location: '/db-web-ui/?silentLoginFailed=true' } });
        }).as('silentLogin');

        queryPage.visit();
        cy.wait('@getProfile');
        cy.intercept('GET', /https:\/\/localhost(.ripe.net)?:9002\/db-web-ui\/api\/user-oidc\/me/).as('getUserInfo');
        cy.wait('@getUserInfo').its('response.statusCode').should('eq', 401);
        queryPage.expectUserLoggedImage(false);
    });

    it('should show the logged icon if the user is logged', () => {
        // we can't use prism to intercept calls to other domains
        cy.intercept('GET', 'db-web-ui/api/user-oidc/me', {
            statusCode: 200,
            body: mockProfile,
        }).as('getProfile');
        queryPage.visit();
        cy.wait('@getProfile');
        cy.intercept('GET', /https:\/\/localhost(.ripe.net)?:9002\/db-web-ui\/api\/user-oidc\/me/).as('getUserInfo');
        cy.wait('@getUserInfo');
        queryPage.expectUserLoggedImage(true);
    });

    it('should show the session expired banner when SSE pushes session-expired', () => {
        cy.intercept('GET', 'db-web-ui/api/user-oidc/me', {
            statusCode: 200,
            body: mockProfile,
        }).as('getProfile');

        cy.intercept('GET', '**/oauth2/authorization/keycloak**', (req) => {
            req.reply({ statusCode: 302, headers: { Location: '/db-web-ui/?silentLoginFailed=true' } });
        }).as('silentLogin');

        cy.intercept('GET', '**/api/session/events', (req) => {
            req.reply({
                statusCode: 200,
                headers: { 'Content-Type': 'text/event-stream' },
                body: 'event: session-expired\ndata: expired\n\n',
            });
        }).as('sessionEvents');

        webupdatesPage.visit('select');
        cy.wait('@getProfile');
        cy.wait('@sessionEvents');

        webupdatesPage.expectWarningMessageToContain('Your RIPE NCC Access session has expired. You need to login again.');
    });

    it('should not show the banner when the user is logged', () => {
        cy.intercept('GET', 'db-web-ui/api/user-oidc/me', {
            statusCode: 200,
            body: mockProfile,
        }).as('getProfile');
        webupdatesPage.visit('select');
        cy.wait('@getProfile');
        cy.get('.modal-content').should('not.exist');
        webupdatesPage
            .selectObjectType('person')
            .clickOnCreateButton()
            .expectHeadingTitleToContain('Create "person" object')
            .typeOnField('person', 'Test t')
            .typeOnField('e-mail', 'test@ripe.net');

        webupdatesPage.submitForm();
        webupdatesPage.expectUserLoggedImage(true);
    });
});
