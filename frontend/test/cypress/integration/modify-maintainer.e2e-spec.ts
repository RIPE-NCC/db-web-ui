import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an maintainer', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/RIPE/mntner/SHRYANE-MNT');
    });

    it('should add auth attribute after associate maintainer', () => {
        webupdatesPage
            .expectModalToExist(true)
            .authenticateWithEnabledAssociate('SHRYANE-MNT')
            .expectNumberOfFields('auth', 4)
            .expectValueInField('auth', 'MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1', 0)
            .expectValueInField('auth', 'SSO isvonja@ripe.net', 1)
            .expectValueInField('auth', 'SSO bad@ripe.net', 2);
    });

    it('should unfiltered auth after associate maintainer', () => {
        webupdatesPage
            .expectModalToExist(true)
            .expectNumberOfFields('auth', 3)
            .expectValueInField('auth', 'MD5-PW # Filtered', 0)
            .expectValueInField('auth', 'SSO # Filtered', 1)
            .authenticateWithEnabledAssociate('SHRYANE-MNT')
            .expectNumberOfFields('auth', 4)
            .expectValueInField('auth', 'MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1', 0)
            .expectValueInField('auth', 'SSO isvonja@ripe.net', 1);
    });

    it('should unfiltered auth after password authentification', () => {
        webupdatesPage
            .expectModalToExist(true)
            .expectNumberOfFields('auth', 3)
            .expectValueInField('auth', 'MD5-PW # Filtered', 0)
            .expectValueInField('auth', 'SSO # Filtered', 1)
            .authenticateWithDisabledAssociate('SHRYANE-MNT')
            .expectNumberOfFields('auth', 3)
            .expectValueInField('auth', 'MD5-PW $1$rIzfDZQA$hkH9XUzie2P4E7g18jwlT1', 0)
            .expectValueInField('auth', 'SSO bad@ripe.net', 1);
    });
});
