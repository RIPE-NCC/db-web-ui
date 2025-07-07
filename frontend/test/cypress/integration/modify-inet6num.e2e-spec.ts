import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an inet6num', () => {
    const webupdatesPage = new WebupdatesPage();

    describe('which is an allocation', () => {
        beforeEach(() => {
            webupdatesPage.visit('modify/RIPE/inet6num/2001:999:2000::%2F36').authenticateWithDisabledAssociate('TEST11-MNT');
        });

        it('should show input controls in the correct disabled or enabled state', () => {
            webupdatesPage
                .expectMaintainerToContain('TEST11-MNT')
                .expectMaintainerToContain('RIPE-NCC-HM-MNT')
                .expectDisabledMaintainer(true)
                .expectFieldToExist('netname', true)
                .expectDisabledField('netname', true)
                .expectFieldToExist('assignment-size', true)
                .expectDisabledField('assignment-size', true)
                .expectDisabledDelete(true);
        });
    });

    describe('which is an assignment', () => {
        beforeEach(() => {
            webupdatesPage.visit('modify/RIPE/inet6num/2001:998:2000::%2F36').authenticateWithDisabledAssociate('TEST11-MNT');
        });

        it('should show input controls in the correct disabled or enabled state', function () {
            webupdatesPage
                .expectMaintainerToContain('TEST11-MNT')
                .expectMaintainerToContain('RIPE-NCC-END-MNT')
                .expectDisabledMaintainer(false)
                .expectFieldToExist('netname', true)
                .expectDisabledField('netname', false)
                .expectFieldToExist('assignment-size', true)
                .expectDisabledField('assignment-size', true)
                .expectDisabledDelete(true);
        });
    });

    describe('which is an allocated by lir', () => {
        beforeEach(() => {
            webupdatesPage.visit('modify/RIPE/inet6num/2002:998:2000::%2F36').authenticateWithDisabledAssociate('TEST11-MNT');
        });

        it('should show delete btn', () => {
            webupdatesPage.expectMaintainerToContain('TEST11-MNT').expectDisabledDelete(false);
        });

        it('should switch to text editor', () => {
            webupdatesPage.clickEditInTextArea().expectTextupdatePage('inet6num/2002:998:2000::%2F36');
        });

        it('should not show delete btn in text editor', () => {
            webupdatesPage.clickEditInTextArea().expectTextupdatePage('inet6num/2002:998:2000::%2F36').expectDeleteButtonToExist(true);
        });
    });
});
