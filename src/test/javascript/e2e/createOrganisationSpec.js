/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The organisation editor', function () {

    beforeEach(function () {
        browser.get('/#/webupdates/create/RIPE/organisation');
        browser.addMockModule('dbWebAppE2E', mockModule.module);
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should not crash when showing the single line editor', function () {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        expect(page.selectMaintainerDropdown.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuchelement')).isPresent()).toEqual(false);
    });

    it('should be able to switch to text mode and back', function () {
        expect(page.createForm.isPresent()).toEqual(true);
        page.btnCreateInTextArea.click();
        expect(page.textCreateForm.isPresent()).toEqual(true);
        page.btnSwitchToWebCreate.click();
    });

    it('should have the right attributes', function () {
        expect(page.inpOrgName.isPresent()).toEqual(true);
        expect(page.inpOrgName.getAttribute('disabled')).toBeFalsy();

        expect(page.inpOrganisation.isPresent()).toEqual(true);
        expect(page.inpOrganisation.getAttribute('disabled')).toBeFalsy();
        expect(page.inpOrganisation.getAttribute('value')).toEqual('AUTO-1');

        expect(page.inpOrgType.isPresent()).toEqual(true);
        expect(page.inpOrgType.getAttribute('disabled')).toBeTruthy();

        expect(page.inpAddress.isPresent()).toEqual(true);
        expect(page.inpAddress.getAttribute('disabled')).toBeFalsy();

        expect(page.inpEmail.isPresent()).toEqual(true);
        expect(page.inpEmail.getAttribute('disabled')).toBeFalsy();

        expect(page.inpAbuseC.isPresent()).toEqual(true);
        expect(page.inpAbuseC.getAttribute('disabled')).toBeFalsy();

        expect(page.inpMntRef.isPresent()).toEqual(true);
        expect(page.inpMntRef.getAttribute('disabled')).toBeFalsy();

        expect(page.inpSource.isPresent()).toEqual(true);
        expect(page.inpSource.getAttribute('disabled')).toBeTruthy();
    });

    it('should accept a valid abuse-c value', function () {
        expect(page.btnAbuseCBell.isPresent()).toEqual(true);
        page.takeScreenshot();
        // TODO: implement test
    });

    xit('should validate input fields', function () {
        // TODO: test field validation
    });

    xit('should work in single line mode', function () {
        // TODO: create an org in single line mode
    });

});
