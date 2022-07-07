import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying a role object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/RIPE/ROLE/ABDE2-RIPE');
    });

    it('should be able to modify object even if object type is in capital letters', () => {
        webupdatesPage.authenticateWithDisabledAssociate('AS8560-MNT').typeOnField('abuse-mailbox', 'newemail@ripe.net').submitModification();
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/ROLE/ABDE2-RIPE?method=Modify');
    });
});
