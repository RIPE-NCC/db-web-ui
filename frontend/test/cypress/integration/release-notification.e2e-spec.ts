import { QueryPage } from '../pages/query.page';

describe('Release notification', () => {
    const queryPage = new QueryPage();
    const targetProperties = './test/e2e/mocks/e2eTestAppConstants/a8d8b4d3fe6dadf2b3a5932b18e707254c804ece.json';
    const defaultProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-default.json';
    const newReleaseProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-new-release.json';

    afterEach(() => {
        cy.changeJsonResponseFile(defaultProperties, targetProperties);
    });

    it('should show the banner when new build is released', () => {
        queryPage.visit();
        cy.get('banner').should('have.length', 0);
        cy.changeJsonResponseFile(newReleaseProperties, targetProperties);
        cy.get('banner').should('have.length', 1);
        cy.get('banner').should('contain.text', 'There is a new release available. Click reload to start using it.');
    });

    it('should show only 1 banner', () => {
        queryPage.visit();
        cy.get('banner').should('have.length', 0);
        cy.changeJsonResponseFile(newReleaseProperties, targetProperties);
        cy.get('banner').should('have.length', 1);
        cy.changeJsonResponseFile(defaultProperties, targetProperties);
        // here we wait until the next tick of RELEASE_NOTIFICATION_POLLING
        cy.wait(5000);
        cy.get('banner').should('have.length', 1);
    });

    it('should show the banner after reloading', () => {
        queryPage.visit();
        cy.get('banner:visible').should('have.length', 0);
        cy.changeJsonResponseFile(newReleaseProperties, targetProperties);
        cy.get('banner:visible').should('have.length', 1);
        cy.get('banner .warning-banner button:contains("Dismiss")').click();
        cy.get('banner:visible').should('have.length', 0);
        cy.changeJsonResponseFile(defaultProperties, targetProperties);
        cy.get('banner:visible').should('have.length', 0);
    });
});
