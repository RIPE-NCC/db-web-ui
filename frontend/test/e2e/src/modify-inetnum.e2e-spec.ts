import { browser } from 'protractor';

const page = require('./homePageObject');

describe('Modifying an inetnum', () => {
    beforeEach(() => {});

    it('should prompt for user to add default maintainer in webupdates', () => {
        page.navigateTo(browser.baseUrl + 'webupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('The default LIR Maintainer has not yet been set up for this object');
    });

    it('should prompt for user to add default maintainer in text updates', () => {
        page.navigateTo(browser.baseUrl + 'textupdates/modify/RIPE/inetnum/185.102.172.0%20-%20185.102.175.255');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('The default LIR Maintainer has not yet been set up for this object');
    });

    describe('which has NOT-SET status', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'webupdates/modify/RIPE/inetnum/193.96.3.0%20-%20193.96.3.255');
        });

        it('should have status box enabled', async () => {
            page.modalInpPassword.sendKeys('UUNETDE-I');
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);
            await page.scrollIntoCenteredView(page.inpStatus);
            expect(page.inpStatus.isPresent()).toBe(true);
            expect(page.inpStatus.getAttribute('disabled')).toBeFalsy();
        });
    });

    describe('which has ASSIGNED PA status', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'webupdates/modify/RIPE/inetnum/194.219.52.224%20-%20194.219.52.239');
        });

        it('should have status box disabled', async () => {
            page.modalInpPassword.sendKeys('TPOLYCHNIA4-MNT');
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);
            await page.scrollIntoCenteredView(page.inpStatus);
            expect(page.inpStatus.isPresent()).toBe(true);
            expect(page.inpStatus.getAttribute('disabled')).toBeTruthy();
        });

        it('which is an end user assignment should NOT show delete btn', () => {
            page.navigateTo(browser.baseUrl + 'webupdates/modify/RIPE/inetnum/91.208.34.0%20-%2091.208.34.255');
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });
    });
});
