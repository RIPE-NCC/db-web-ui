import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an inetnum', () => {
    const webupdatesPage = new WebupdatesPage();

    it('should prompt for user to add default maintainer in webupdates', () => {
        cy.visit('webupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        webupdatesPage.getModalAuthentication().expectBannerToContain('The default LIR Maintainer has not yet been set up for this object');
    });

    it('should prompt for user to add default maintainer in text updates', () => {
        cy.visit('textupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        webupdatesPage.getModalAuthentication().expectBannerToContain('The default LIR Maintainer has not yet been set up for this object');
    });

    describe('which has NOT-SET status', () => {
        it('should have status box enabled', () => {
            webupdatesPage.visit('modify/RIPE/inetnum/193.96.3.0%20-%20193.96.3.255');
            webupdatesPage.getModalAuthentication().typePassword('TEST09-MNT').disableAssociateCheckbox().submitModal();
            webupdatesPage.expectModalToExist(false).expectFieldToExist('status', true).expectDisabledField('status', false);
        });
    });

    describe('which has ASSIGNED PA status', () => {
        it('should have status box disabled', () => {
            webupdatesPage.visit('modify/RIPE/inetnum/194.219.52.224%20-%20194.219.52.239');
            webupdatesPage.getModalAuthentication().typePassword('TST03-MNT').disableAssociateCheckbox().submitModal();
            webupdatesPage.expectModalToExist(false).expectFieldToExist('status', true).expectDisabledField('status', true);
        });

        it('which is an end user assignment should NOT show delete btn', () => {
            webupdatesPage.visit('modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255').expectDisabledDelete(true);
        });

        it('should switch to text editor', () => {
            webupdatesPage
                .visit('modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255')
                .clickEditInTextArea()
                .expectTextupdatePage('inetnum/91.208.34.0%20-%2091.208.34.255');
        });

        it('which is an end user assignment should NOT show delete btn in text editor', () => {
            webupdatesPage
                .visit('modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255')
                .clickEditInTextArea()
                .expectTextupdatePage('inetnum/91.208.34.0%20-%2091.208.34.255')
                .expectDeleteButtonToExist(false);
        });
    });

    describe('which has ALLOCATED PA status', () => {
        it('should have only status ALLOCATED-ASSIGNED PA', () => {
            webupdatesPage.visit('modify/RIPE/inetnum/193.228.143.0%20-%20193.228.143.255');
            webupdatesPage.getModalAuthentication().typePassword('TESTMD-MNT').disableAssociateCheckbox().submitModal();
            webupdatesPage
                .expectModalToExist(false)
                .expectFieldToExist('status', true)
                .expectDisabledField('status', false)
                .expectOptionSizeFromNgSelect('status', 1)
                .expectOptionFromNgSelect('status', 'ALLOCATED-ASSIGNED PA');
        });
    });

    describe('which has ALLOCATED-ASSIGNED PA status', () => {
        it('should have only status ALLOCATED PA', () => {
            webupdatesPage.visit('modify/RIPE/inetnum/80.73.136.0%20-%2080.73.143.255');
            webupdatesPage.getModalAuthentication().typePassword('TESTMD-MNT').disableAssociateCheckbox().submitModal();
            webupdatesPage
                .expectModalToExist(false)
                .expectFieldToExist('status', true)
                .expectDisabledField('status', false)
                .expectOptionSizeFromNgSelect('status', 1)
                .expectOptionFromNgSelect('status', 'ALLOCATED PA');
        });
    });
});
