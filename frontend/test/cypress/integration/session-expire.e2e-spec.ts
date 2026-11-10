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

    const mock200CreatePerson = {
        link: {
            type: 'locator',
            href: 'https://localhost.ripe.net/RIPE/person?clientIp=127.0.0.1',
        },
        objects: {
            object: [
                {
                    type: 'person',
                    link: {
                        type: 'locator',
                        href: 'https://localhost.ripe.net/ripe/person/TT1-RIPE',
                    },
                    source: {
                        id: 'ripe',
                    },
                    'primary-key': {
                        attribute: [
                            {
                                name: 'nic-hdl',
                                value: 'TT1-RIPE',
                            },
                        ],
                    },
                    attributes: {
                        attribute: [
                            {
                                name: 'person',
                                value: 'Test t',
                            },
                            {
                                name: 'e-mail',
                                value: 'test@ripe.net',
                            },
                            {
                                name: 'nic-hdl',
                                value: 'TT1-RIPE',
                            },
                            {
                                name: 'created',
                                value: '2026-11-09T14:57:09Z',
                            },
                            {
                                name: 'last-modified',
                                value: '2026-11-09T14:57:09Z',
                            },
                            {
                                name: 'source',
                                value: 'TEST',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT',
                                },
                                name: 'mnt-by',
                                value: 'TEST-MNT',
                                'referenced-type': 'mntner',
                            },
                        ],
                    },
                },
            ],
        },
        'terms-and-conditions': {
            type: 'locator',
            href: 'https://docs.db.ripe.net/terms-conditions.html',
        },
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
        cy.wait('@getProfile').its('response.statusCode').should('eq', 401);
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

    it('should show the user as logged in when the user is logged', () => {
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

        cy.intercept('POST', 'db-web-ui/api/whois/RIPE/person', {
            statusCode: 200,
            body: mock200CreatePerson,
        }).as('createPerson');
        webupdatesPage.submitForm();
        cy.wait('@getProfile');

        webupdatesPage.expectUserLoggedImage(true);
    });

    it('should show the user as logged out when session closed', () => {
        cy.intercept('GET', 'db-web-ui/api/user-oidc/me', {
            statusCode: 200,
            body: mockProfile,
        }).as('getProfile');

        cy.intercept('GET', '**/api/session/events', (req) => {
            req.reply({
                statusCode: 200,
                headers: { 'Content-Type': 'text/event-stream' },
                body: 'event: session-closed\ndata: expired\n\n',
                delay: 2000,
            });
        }).as('sessionEvents');

        queryPage.visit();
        cy.wait('@getProfile');

        queryPage.expectUserLoggedImage(true);

        cy.wait('@sessionEvents');
        queryPage.expectUserLoggedImage(false);
    });
});
