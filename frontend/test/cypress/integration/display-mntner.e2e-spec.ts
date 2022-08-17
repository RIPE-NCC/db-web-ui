import { WebupdatesPage } from '../pages/webupdates.page';

describe('Display an mntner', () => {
    const webupdatesPage = new WebupdatesPage();

    it('should remove Filtered in display page after associating SSO mnt', () => {
        webupdatesPage
            .visit('modify/ripe/mntner/ERICSSON-MNT')
            .expectValueInField('auth', 'MD5-PW # Filtered', 0)
            .authenticateWithEnabledAssociate('ERICSSON-MNT')
            .expectValueInField('auth', 'MD5-PW $1$mKp9u2Od$PhAfg9I6Z8V.xtWmALO4x.', 0)
            .expectValueInField('auth', 'SSO isvonja@ripe.net', 1)
            .submitModification()
            .expectSuccessMessage('Your object has been successfully modified')
            // after submitting on display page shouldn't contain Filtered word
            .expectedFilteredFields(false);
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/mntner/ERICSSON-MNT?method=Modify');
    });
});
