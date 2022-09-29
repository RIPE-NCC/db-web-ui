import { QueryPage } from '../pages/query.page';

describe('Release notification', () => {
    const queryPage = new QueryPage();
    const targetProperties = './test/e2e/mocks/e2eTestAppConstants/a8d8b4d3fe6dadf2b3a5932b18e707254c804ece.json';
    const defaultProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-default.json';
    const newReleaseProperties = './test/e2e/mocks/e2eTestAppConstants/app-constants-new-release.json';

    after(() => {
        cy.changeJsonResponseFile(defaultProperties, targetProperties);
    });

    it('should show the banner when new build is released', () => {
        queryPage.visit();
        cy.get('app-banner[level="warning"]').should('have.length', 1);
        cy.changeJsonResponseFile(newReleaseProperties, targetProperties);
        cy.get('app-banner[level="warning"]').should('have.length', 2);
        cy.get('app-banner[level="warning"]', { timeout: 10000 })
            .eq(1)
            .shadow()
            .find('.app-banner.level-warning')
            .should('contain.text', 'There is a new release available. Click reload to start using it.');
    });
});
