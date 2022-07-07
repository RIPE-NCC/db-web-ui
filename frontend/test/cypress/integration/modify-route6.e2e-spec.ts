import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying a resource for a route6 object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/route6/2a09:4c2::%2F32AS58057');
    });

    it('should open route6 lookup page on click on force delete in modal authentication window', () => {
        webupdatesPage.getModalAuthentication().expectFooterToContain('Force delete this object?').clickOnForceDelete();
        cy.expectCurrentUrlToContain('forceDelete/ripe/route6/2a09:4c2::%2F32AS58057');
    });
});
