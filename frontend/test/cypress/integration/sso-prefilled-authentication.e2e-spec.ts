import { WebupdatesPage } from '../pages/webupdates.page';

describe('SSO prefilled authentication when TEST env', () => {
    const webupdatesPage = new WebupdatesPage();

    const targetProperties = './test/e2e/mocks/e2eTestAppConstants/a8d8b4d3fe6dadf2b3a5932b18e707254c804ece.json';
    const defaultProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-default.json';
    const testProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-test-env.json';

    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const guessUser = './test/e2e/mocks/e2eTest/user-with-guest-role.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';

    afterEach(() => {
        cy.changeJsonResponseFile(defaultProperties, targetProperties);
        cy.changeJsonResponseFile(userWithAllRoles, userInfoFile);
    });

    beforeEach(() => {
        cy.changeJsonResponseFile(testProperties, targetProperties);
    });

    it('should associate SSO mntner if submitted', () => {
        cy.intercept(
            'PUT',
            '**/db-web-ui/api/whois/ripe/mntner/RIPE-NCC-END-MNT?override=whois%2Ctest%2CAutomatically%20Added%20SSO%20%7Bnotify%3Dfalse%7D',
        ).as('ssoUpdated');

        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
        webupdatesPage.getModalSSOPrefilledAuthentication().expectSelectedAuthenticationMaintainer('TEST21-MNT').submitModal();
        webupdatesPage.expectModalToExist(false);
        cy.wasUrlCalled('ssoUpdated').then((wasCalled: any) => {
            expect(wasCalled).to.be.true;
        });
    });

    it('should not associate SSO mntner if modal is closed', () => {
        cy.intercept(
            'PUT',
            '**/db-web-ui/api/whois/ripe/mntner/RIPE-NCC-END-MNT?override=whois%2Ctest%2CAutomatically%20Added%20SSO%20%7Bnotify%3Dfalse%7D',
        ).as('ssoUpdated');

        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
        webupdatesPage.getModalSSOPrefilledAuthentication().expectSelectedAuthenticationMaintainer('TEST21-MNT').closeModal();
        webupdatesPage.expectModalToExist(false);
        cy.wasUrlCalled('ssoUpdated').then((wasCalled: any) => {
            expect(wasCalled).to.be.false;
        });
    });

    it('should remove Filtered in display page after associating SSO mnt', () => {
        cy.intercept('PUT', '**/db-web-ui/api/whois/ripe/mntner/TEST21-MNT?override=whois%2Ctest%2CAutomatically%20Added%20SSO%20%7Bnotify%3Dfalse%7D').as(
            'ssoUpdated',
        );

        webupdatesPage.visit('modify/ripe/mntner/TEST21-MNT').expectValueInField('auth', 'SSO # Filtered', 0);

        webupdatesPage.getModalSSOPrefilledAuthentication().expectSelectedAuthenticationMaintainer('TEST21-MNT').submitModal();
        webupdatesPage.expectValueInField('auth', 'SSO teste2e@ripe.net', 0).expectValueInField('auth', 'SSO isvonja@ripe.net', 1);

        cy.wasUrlCalled('ssoUpdated').then((wasCalled: any) => {
            expect(wasCalled).to.be.true;
        });
    });

    it('should show authenticate error when modal window is dismissed', () => {
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
        webupdatesPage.visit('select').selectObjectType('inetnum').clickOnCreateButton();
        webupdatesPage.typeOnField('inetnum', '5.254.68.40/29').blurOnField('inetnum').getModalAuthentication().closeModal();
        webupdatesPage.expectErrorOnField('inetnum', 'Failed to authenticate parent resource').expectErrorMessage('Failed to authenticate parent resource');
    });
});
