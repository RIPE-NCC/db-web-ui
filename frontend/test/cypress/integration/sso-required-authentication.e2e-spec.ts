import { WebupdatesPage } from '../pages/webupdates.page';

describe('Not SSO prefilled authentication when PROD env', () => {
    const webupdatesPage = new WebupdatesPage();

    it('should display error if SSO not authenticated', () => {
        cy.intercept('GET', '**/db-web-ui/api/user/mntners', {
            statusCode: 200,
            body: [
                {
                    mine: true,
                    auth: ['SSO'],
                    type: 'mntner',
                    key: 'TEST03-MNT',
                },
            ],
        });

        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
        webupdatesPage
            .expectModalToExist(true)
            .getModalAuthentication()
            .expectBannerToContain('You cannot modify this object here because your SSO account is not associated with any of the maintainers.');
    });

    it('should not display error if SSO authenticated', () => {
        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
        webupdatesPage.expectModalToExist(false);
    });

    it('should redirect when modal is closed', () => {
        cy.intercept('GET', '**/db-web-ui/api/user/mntners', {
            statusCode: 200,
            body: [
                {
                    mine: true,
                    auth: ['SSO'],
                    type: 'mntner',
                    key: 'TEST03-MNT',
                },
            ],
        });

        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
        webupdatesPage
            .expectModalToExist(true)
            .getModalAuthentication()
            .expectBannerToContain('You cannot modify this object here because your SSO account is not associated with any of the maintainers.')
            .closeModal();
        cy.expectCurrentUrlToContain('query');
    });
});
