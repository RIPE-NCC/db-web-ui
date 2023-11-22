import { NotFoundPage } from '../pages/not-found.page';

describe('The NotFoundPageComponent', () => {
    const notFoundPage = new NotFoundPage();

    beforeEach(() => {
        notFoundPage.visit();
    });

    it('should navigate to query page click on Search for an object', () => {
        notFoundPage.clickButtonNavigateToSearch();
        cy.expectCurrentUrlToContain('query');
    });

    it('should navigate to create page click on Create an object', () => {
        notFoundPage.clickButtonNavigateToCreate();
        cy.expectCurrentUrlToContain('webupdates/select');
    });
});
