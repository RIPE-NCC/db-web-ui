import { WebupdatesPage } from '../pages/webupdates.page';

describe('Delete a role object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/role/IA6414-RIPE');
    });

    it('should be able to pick up reason of deleting object', () => {
        webupdatesPage.clickOnDeleteObjectButton().expectToShowModal().typeReason('my own reason').clickOnConfirmDeleteObject();
        cy.expectCurrentUrlToContain('webupdates/delete/ripe/role/IA6414-RIPE?onCancel=webupdates%2Fmodify');
    });
});
