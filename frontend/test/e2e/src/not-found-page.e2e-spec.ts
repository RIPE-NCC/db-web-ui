import { browser } from 'protractor';

const page = require('./homePageObject');

describe('The NotFoundPageComponent', () => {
    beforeEach(() => {
        page.navigateTo(browser.baseUrl + '/not-found');
    });

    it('should navigate to query page click on Search for an object', () => {
        page.btnNavigateToSearch.click();
        expect(browser.getCurrentUrl()).toContain('query');
    });

    it('should navigate to create page click on Create an object', () => {
        page.btnNavigateToCreate.click();
        expect(browser.getCurrentUrl()).toContain('webupdates/select');
    });
});
