import { browser } from 'protractor';

const page = require('./homePageObject');

describe('Modifying a resource for a route6 object', () => {
    beforeEach(() => {
        page.navigateTo(browser.baseUrl + 'webupdates/modify/ripe/route6/2a09:4c2::%2F32AS58057');
    });

    it('should open route6 lookup page on click on force delete in modal authentication window', () => {
        expect(page.modal.isPresent()).toEqual(true);
        expect(page.modalFooter.getText()).toContain('Force delete this object?');
        page.modalFooterForceDeleteLink.click();
        expect(browser.getCurrentUrl()).toContain('forceDelete/ripe/route6/2a09:4c2::%2F32AS58057');
    });
});
