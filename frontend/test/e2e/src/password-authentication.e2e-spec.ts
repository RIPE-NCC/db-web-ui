const page = require('./homePageObject');

describe('The password authentication dialogue', () => {
    beforeEach(() => {
        page.navigateTo('webupdates/modify/ripe/aut-num/AS9191');
    });

    it('should show a single modal which asks for a password', async () => {
        expect(page.modalBtnSubmit.isPresent()).toEqual(true);
        expect(page.modalInpMaintainer.getText()).toEqual('NEWNET-MNT');
        // RIPE NCC MAINTAINERS should be filtered out
        expect(page.modalInpMaintainer.getText()).not.toContain('RIPE-NCC-MNT');
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('NEWNET-MNT');
        page.modalBtnSubmit.click();

        // i'm unhappy with this test. it should be able to detect if an element is visible or not
        expect(page.allObjectRows.count()).toEqual(395);
        expect(page.allObjectRows.get(394).isPresent()).toEqual(true);
        expect(page.allObjectRows.get(0).isDisplayed()).toEqual(true);
        expect(page.allObjectRows.get(387).isDisplayed()).toEqual(true);
        await page.scrollIntoCenteredView(page.btnDeleteObject);
    });
});
