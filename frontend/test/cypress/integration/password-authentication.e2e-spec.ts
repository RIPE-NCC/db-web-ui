import { WebupdatesPage } from '../pages/webupdates.page';

describe('The password authentication dialogue', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/aut-num/AS9191');
    });

    it('should show a single modal which asks for a password', () => {
        webupdatesPage
            .getModalAuthentication()
            .expectSelectedAuthenticationMaintainer('NEWNET-MNT')
            // RIPE NCC MAINTAINERS should be filtered out
            .expectItemInList('RIPE-NCC-MNT', false)
            .disableAssociateCheckbox()
            .typePassword('NEWNET-MNT')
            .submitModal();
        webupdatesPage.expectModalToExist(false);
    });
});
