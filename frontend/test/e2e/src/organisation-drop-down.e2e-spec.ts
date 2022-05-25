import { browser } from 'protractor';

const page = require('./homePageObject');

describe('The organisation drop-down box', () => {
    beforeEach(() => {
        page.navigateTo(browser.baseUrl + 'myresources/overview');
    });

    it('should be shown when a user has an LIR', () => {
        expect(page.orgSelector.isPresent()).toEqual(true);
        page.orgSelector.click();
        expect(page.orgSelectorOptions.count()).toBe(5);
    });

    it('should be ordered members and the end users organisations sorted alphabetically by name', () => {
        page.orgSelector.click();
        expect(page.orgSelectorOptions.isPresent()).toEqual(true);
        // member
        expect(page.orgSelectorOptions.get(0).getText()).toEqual('nl.surfnet');
        expect(page.orgSelectorOptionsElName.get(0).getText()).toContain('SURFnet bv');
        expect(page.orgSelectorOptions.get(1).getText()).toEqual('nl.abelohost3');
        expect(page.orgSelectorOptionsElName.get(1).getText()).toContain('Westernunion');
        // end users organisations
        expect(page.orgSelectorOptions.get(2).getText()).toEqual('ORG-WA56-RIPE');
        expect(page.orgSelectorOptionsElName.getText()).toContain('Swi Rop Gonggrijp');
        expect(page.orgSelectorOptions.get(3).getText()).toEqual('ORG-VA397-RIPE');
        expect(page.orgSelectorOptionsElName.getText()).toContain('Viollier AG');
    });
});
