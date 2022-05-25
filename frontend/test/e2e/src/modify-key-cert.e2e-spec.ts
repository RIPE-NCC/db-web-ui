import { browser } from 'protractor';

const page = require('./homePageObject');

describe('Modifying an key-cert', () => {
    beforeEach(() => {});

    it('should show error message above certif field', async () => {
        page.navigateTo(browser.baseUrl + 'webupdates/modify/ripe/key-cert/PGPKEY-TESTKEYCERT');
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalBody.getText()).toContain('SYSTEM');
        page.modalInpPassword.sendKeys('SYSTEM');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.inpCertif.isPresent()).toBe(true);
        await page.scrollIntoCenteredView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        expect(page.inpErrorCertif.isPresent()).toBe(true);
        expect(page.inpErrorCertif.getText()).toBe('The supplied key is revoked');
    });
});
