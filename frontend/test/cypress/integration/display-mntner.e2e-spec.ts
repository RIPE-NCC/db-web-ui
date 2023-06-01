import { WebupdatesPage } from '../pages/webupdates.page';

describe('Display an mntner', () => {
    const webupdatesPage = new WebupdatesPage();

    it.only('should remove Filtered in display page after associating SSO mnt', () => {
        webupdatesPage
            .visit('modify/ripe/mntner/TEST03-MNT')
            .expectValueInField('auth', 'MD5-PW # Filtered', 0)
            .authenticateWithEnabledAssociate('TEST03-MNT')
            .expectValueInField('auth', 'MD5-PW $1$TEST1234$ABcdEfGHiJkLMnO56789/', 0)
            .expectValueInField('auth', 'SSO isvonja@ripe.net', 1)
            .submitModification()
            .expectSuccessMessage('Your object has been successfully modified')
            // after submitting on display page shouldn't contain Filtered word
            .expectedFilteredFields(false);
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/mntner/TEST03-MNT?method=Modify');
    });
});
