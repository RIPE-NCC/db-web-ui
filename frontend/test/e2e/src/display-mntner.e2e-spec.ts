import { browser, protractor } from 'protractor';

const page = require('./homePageObject');
const until = protractor.ExpectedConditions;

describe('Display an mntner', () => {
    it('should remove Filtered in diplay page after associating SSO mnt', async () => {
        page.navigateTo(browser.baseUrl + 'webupdates/modify/ripe/mntner/ERICSSON-MNT');
        await page.disableLiveChat();
        expect(page.inpAuth.get(0).getAttribute('value')).toBe('MD5-PW # Filtered');
        await browser.wait(until.visibilityOf(page.modalBtnSubmit), 5000, 'waited too long');
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalBtnSubmit.click();
        expect(page.inpAuth.get(0).getAttribute('value')).toBe('MD5-PW $1$mKp9u2Od$PhAfg9I6Z8V.xtWmALO4x.');
        expect(page.inpAuth.get(1).getAttribute('value')).toBe('SSO isvonja@ripe.net');
        await page.scrollIntoCenteredView(page.btnSubmitModify);
        page.btnSubmitModify.click();
        // after submitting on display page shouldn't contain Filtered word
        expect(browser.getCurrentUrl()).toContain('webupdates/display/RIPE/mntner/ERICSSON-MNT?method=Modify');
        expect(page.successMessage.getText()).toContain('Your object has been successfully modified');
        expect(page.displayPanel.isDisplayed()).toBeTruthy();
        expect(page.displayPanel.getText()).not.toContain('Filtered');
    });
});
