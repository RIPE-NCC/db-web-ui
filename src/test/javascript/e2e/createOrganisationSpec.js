/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

describe('webupdates homepage', function() {

    beforeEach(function() {
        browser.get('/#/webupdates/create/RIPE/organisation');
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should not crash when showing index page', function() {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        expect(page.selectMaintainerDropdown.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuchelement')).isPresent()).toEqual(false);
    });

    it('should be able to switch to text mode and back', function() {
        expect(page.createForm.isPresent()).toEqual(true);
        page.btnCreateInTextArea.click();
        expect(page.textCreateForm.isPresent()).toEqual(true);
        page.btnSwitchToWebCreate.click();
    });

    it('should have the right attributes for an organisation', function() {
        expect(page.inpOrgName.isPresent()).toEqual(true);
        expect(page.inpOrganisation.isPresent()).toEqual(true);
        expect(page.inpOrgType.isPresent()).toEqual(true);
        expect(page.inpAddress.isPresent()).toEqual(true);
        expect(page.inpEmail.isPresent()).toEqual(true);
        expect(page.inpAbuseC.isPresent()).toEqual(true);
        expect(page.inpMntRef.isPresent()).toEqual(true);
        expect(page.inpSource.isPresent()).toEqual(true);

        expect(page.inpOrgType.getAttribute('disabled')).toEqual('true');
        expect(page.inpSource.getAttribute('disabled')).toEqual('true');
        expect(page.inpOrganisation.getAttribute('value')).toEqual('AUTO-1');
    });

});
