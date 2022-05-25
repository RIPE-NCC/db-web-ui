import { browser } from 'protractor';

const page = require('./homePageObject');

describe('Modifying a role object', () => {
    beforeEach(async () => {
        await page.navigateTo(browser.baseUrl + 'webupdates/modify/RIPE/ROLE/ABDE2-RIPE');
        await page.disableLiveChat();
    });

    it('should be able to modify object even if object type is in capital letters', async () => {
        page.modalInpPassword.sendKeys('AS8560-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        await page.scrollIntoCenteredView(page.inpAbuseMailbox);
        page.inpAbuseMailbox.sendKeys('newemail@ripe.net');
        await page.scrollIntoCenteredView(page.btnSubmitModify);
        expect(page.btnSubmitModify.isPresent()).toBeTruthy();
        page.btnSubmitModify.click();
        expect(browser.getCurrentUrl()).toContain('webupdates/display/RIPE/ROLE/ABDE2-RIPE?method=Modify');
    });
});
