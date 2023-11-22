import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying a role object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/RIPE/ROLE/TSTROLE-RIPE');
    });

    it('should be able to modify object even if object type is in capital letters', () => {
        webupdatesPage.authenticateWithDisabledAssociate('TEST15-MNT').typeOnField('abuse-mailbox', 'newemail@ripe.net').submitModification();
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/ROLE/TSTROLE-RIPE?method=Modify');
    });
});
