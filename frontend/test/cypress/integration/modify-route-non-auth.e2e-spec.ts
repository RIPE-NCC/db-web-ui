import { QueryPage } from '../pages/query.page';
import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying a resource for a NONAUTH-RIPE route object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/route/211.43.192.0%252F19AS9777');
    });

    it('should show out of region route object', () => {
        webupdatesPage
            .authenticateWithDisabledAssociate('AS4663-RIPE-MNT')
            .expectDisabledField('route', true)
            .expectDisabledField('origin', true)
            .expectDisabledField('source', true)
            .expectValueInField('source', 'RIPE-NONAUTH')
            .expectDeleteButtonToExist(true)
            .expectModifyButtonToExist(true);
    });

    it('should be possible for RC to submit change on out of region route object', () => {
        webupdatesPage
            .authenticateWithDisabledAssociate('AS4663-RIPE-MNT')
            .typeOnField('descr', 'update')
            .submitModification()
            .expectSuccessMessage('Your object has been successfully modified')
            .expectChangesPanelToExist(true);
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/route/211.43.192.0%2F19AS9777?method=Modify');
    });

    it('should be possible for RC to delete out of region route object', () => {
        webupdatesPage
            .authenticateWithDisabledAssociate('AS4663-RIPE-MNT')
            .clickOnDeleteObjectButton()
            .expectToShowModal()
            .clickOnConfirmDeleteObject()
            .expectSuccessMessage('The following object(s) have been successfully deleted');
        cy.expectCurrentUrlToContain('webupdates/delete/ripe/route/211.43.192.0%2F19AS9777?onCancel=webupdates%2Fmodify');
    });

    it('should remove info message on navigating to query page', () => {
        webupdatesPage
            .authenticateWithDisabledAssociate('AS4663-RIPE-MNT')
            .clickOnDeleteObjectButton()
            .expectToShowModal()
            .clickOnConfirmDeleteObject()
            .expectSuccessMessage('The following object(s) have been successfully deleted');

        const queryPage = new QueryPage();
        queryPage.visit();

        cy.get('app-banner[level="positive"]').should('not.exist');
    });

    it('should allow force delete on modal-authentication window and navigate to forceDelete', () => {
        webupdatesPage.getModalAuthentication().clickOnForceDelete();
        cy.expectCurrentUrlToContain('forceDelete/ripe/route/211.43.192.0%2F19AS9777');
        webupdatesPage.expectModalToExist(false);
    });
});
