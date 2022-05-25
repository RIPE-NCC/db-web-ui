import { browser, by, protractor } from 'protractor';

const page = require('./homePageObject');

const until = protractor.ExpectedConditions;

describe('The create domain screen', () => {
    beforeEach(() => {
        page.navigateTo(`${browser.baseUrl}webupdates/select`);
        page.selectObjectType('domain').click();
        page.btnNavigateToCreate.click();
    });

    it('should show a domain creation form for IPv4 which rejects invalid nameservers', async () => {
        expect(page.modalSplashText.getText()).toEqual('Creating DOMAIN Objects for Reverse DNS');
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        expect(page.heading.getText()).toEqual(`Create "domain" objects`);
        expect(page.inpPrefix.isDisplayed()).toEqual(true);
        expect(page.inpNserver1.isPresent()).toEqual(false);
        expect(page.inpNserver2.isPresent()).toEqual(false);
        expect(page.inpAdminC4.isPresent()).toEqual(false);

        page.inpPrefix.sendKeys('212.17.110.0/23');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        await browser.wait(until.visibilityOf(page.modalBtnSubmit), 5000, 'waited too long');
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalBtnSubmit.click();

        await browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver1.sendKeys(protractor.Key.TAB);
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        page.inpNserver2.sendKeys(protractor.Key.TAB);
        const liContainer = page.inpNserver2.element(by.xpath('..'));

        await browser.wait(() => {
            return browser.isElementPresent(liContainer.element(by.css('.text-error')));
        }, 5000);

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isPresent()).toEqual(false);
        expect(page.inpTechC5.isPresent()).toEqual(false);
        expect(page.inpZoneC6.isPresent()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        page.inpNserver2.sendKeys(protractor.Key.TAB);
        await browser.wait(() => {
            return browser.isElementPresent(liContainer.element(by.css('.text-info')));
        }, 5000);

        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);
    });

    it('should show a domain creation form for IPv6 which rejects invalid nameservers', async () => {
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await page.scrollIntoCenteredView(page.inpPrefix);
        page.inpPrefix.sendKeys('2001:db8::/48');
        page.inpPrefix.sendKeys(protractor.Key.TAB);

        await browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('ns1.xs4all.nl');
        page.inpNserver1.sendKeys(protractor.Key.TAB);
        page.inpNserver2.sendKeys('nsXXX.xs4all.nl');
        page.inpNserver2.sendKeys(protractor.Key.TAB);
        const liContainer = page.inpNserver2.element(by.xpath('..'));

        await browser.wait(until.visibilityOf(liContainer.element(by.css('.text-error'))), 5000, 'waited too long');

        expect(liContainer.getAttribute('class')).toContain('has-error');
        expect(page.inpAdminC4.isPresent()).toEqual(false);
        expect(page.inpTechC5.isPresent()).toEqual(false);
        expect(page.inpZoneC6.isPresent()).toEqual(false);

        page.inpNserver2.clear();
        page.inpNserver2.sendKeys('ns2.xs4all.nl');
        page.inpNserver2.sendKeys(protractor.Key.TAB);
        await browser.wait(until.visibilityOf(liContainer.element(by.css('.text-info'))), 5000, 'waited too long');

        expect(liContainer.getText()).toContain('0.8.b.d.0.1.0.0.2.ip6.arpa');
        expect(liContainer.getAttribute('class')).not.toContain('has-error');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(1);
        expect(page.inpAdminC4.isDisplayed()).toEqual(true);
        expect(page.inpTechC5.isDisplayed()).toEqual(true);
        expect(page.inpZoneC6.isDisplayed()).toEqual(true);

        // User changes his mind!
        page.inpPrefix.clear();
        page.inpPrefix.sendKeys('212.17.110.0/23');
        page.inpPrefix.sendKeys(protractor.Key.TAB);

        await browser.wait(until.visibilityOf(liContainer.element(by.css('.text-info'))), 5000, 'waited too long');
        expect(liContainer.getText()).not.toContain('0.8.b.d.0.1.0.0.2.ip6.arpa');
    });

    it('should show a popup and a nice message on success', async () => {
        await page.disableLiveChat();
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await browser.wait(() => {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('212.17.110.0/23');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        await browser.wait(() => {
            return browser.isElementPresent(page.modalBtnSubmit);
        }, 5000);

        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalBtnSubmit.click();

        await browser.wait(until.visibilityOf(page.inpNserver1), 5000, 'waited too long');

        page.inpNserver1.sendKeys('rns1.upc.biz');
        page.inpNserver1.sendKeys(protractor.Key.TAB);
        page.inpNserver2.sendKeys('rns2.upc.biz');
        page.inpNserver2.sendKeys(protractor.Key.TAB);

        await browser.wait(until.visibilityOf(page.inpAdminC4), 5000, 'waited too long');
        expect(page.inpReverseZoneTable.all(by.css('tbody tr')).count()).toEqual(2);
        page.inpAdminC4.sendKeys('LG1-RIPE');
        await browser.wait(() => {
            return browser.isElementPresent(page.autocompletePopup);
        }, 5000);
        page.inpAdminC4.sendKeys(protractor.Key.ENTER);
        page.inpTechC5.sendKeys('LG1-RIPE');
        await browser.wait(() => {
            return browser.isElementPresent(page.autocompletePopup);
        }, 5000);
        page.inpTechC5.sendKeys(protractor.Key.ENTER);
        page.inpZoneC6.sendKeys('LG1-RIPE');
        await browser.wait(() => {
            return browser.isElementPresent(page.autocompletePopup);
        }, 5000);
        page.inpZoneC6.sendKeys(protractor.Key.ENTER);
        page.inpZoneC6.sendKeys(protractor.Key.TAB);

        await page.scrollIntoCenteredView(page.btnSubmitObject);
        page.btnSubmitObject.click();

        // FIXME
        // expect(page.modal.isPresent()).toEqual(true);
        // expect(page.modalHeader.getText()).toContain("Processing your domain objects");
        await browser.wait(() => {
            return browser.isElementPresent(page.successMessage);
        }, 5000);
        await page.scrollIntoCenteredView(page.successMessage);
        expect(page.successMessage.getText()).toContain('object(s) have been successfully created');
    });

    it('should show error message with link for existing prefix', async () => {
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await browser.wait(() => {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('193.193.200.0/24');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        await browser.wait(() => {
            return browser.isElementPresent(page.prefixErrMsg);
        }, 5000);
        expect(page.prefixErrMsg.getText()).toContain('Domain(s) already exist under this prefix');
        expect(page.prefixErrMsgLink.getAttribute('href')).toContain(
            'query?bflag=true&dflag=true&hierarchyFlag=exact&rflag=true&searchtext=193.193.200.0/24&source=RIPE&types=domain',
        );
    });

    it('should show error messages for invalid prefix', async () => {
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await browser.wait(() => {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('wrong-prefix');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        await browser.wait(() => {
            return browser.isElementPresent(page.prefixErrMsg);
        }, 5000);
        expect(page.prefixErrMsg.getText()).toContain('Invalid prefix notation');
        page.inpPrefix.clear();
        page.inpPrefix.sendKeys('212.17.110.0/25');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        await browser.wait(() => {
            return browser.isElementPresent(page.prefixErrMsgLink);
        }, 5000);
        expect(page.prefixErrMsg.getText()).toContain('Please use the Syncupdates page to create a domain object smaller than /24');
        expect(page.prefixErrMsgLink.getAttribute('href')).toContain('syncupdates');
        page.inpPrefix.clear();
        page.inpPrefix.sendKeys('84.48.0.0/15');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        expect(page.prefixErrMsg.getText()).toContain('Cannot create domain objects for prefixes larger than /16');
    });

    it("shouldn't show error messages when creating prefix < 24 and mnt-lower is associated", async () => {
        // creating domain with prefix < 24 will result in more domain objects /24
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await browser.wait(() => {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('91.109.48.0/21');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        expect(page.modal.isPresent()).toBeFalsy();
        expect(page.prefixInfoMsg.getText()).toContain('Prefix looks OK');
    });

    it("shouldn't show error messages when creating prefix < 24 and mnt-lower is associated", async () => {
        // creating domain with prefix < 24 will result in more domain objects /24
        await page.scrollIntoCenteredView(page.modalSplashBtn);
        page.modalSplashBtn.click();
        await browser.wait(() => {
            return browser.isElementPresent(page.inpPrefix);
        }, 5000);
        page.inpPrefix.sendKeys('91.109.48.0/21');
        page.inpPrefix.sendKeys(protractor.Key.TAB);
        expect(page.modal.isPresent()).toBeFalsy();
        expect(page.prefixInfoMsg.getText()).toContain('Prefix looks OK');
    });
});
