/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The syncupdates page', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/syncupdates');
    });

    it('should not show preview section if is empty object', function () {
        page.inpSyncupdateString.sendKeys('');
        expect(page.inpSyncupdateString.getAttribute('value')).toEqual('');
        page.scrollIntoView(page.btnUpdate);
        page.btnUpdate.click(); // nothing should happen, everything is ok
        expect(page.inpSyncupdateString.getAttribute('value')).toEqual('');
        expect(page.viewSyncupdateString.isPresent()).toEqual(false);
    });

    it('should show preview area in case object is  incorect', function () {
        var response =
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
            'The following paragraph(s) do not look like objects\n' +
            'and were NOT PROCESSED:\n' +
            '\n' +
            'something\n' +
            '\n' +
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';

        page.inpSyncupdateString.sendKeys('something');
        expect(page.inpSyncupdateString.getAttribute('value')).toEqual('something');
        page.scrollIntoView(page.btnUpdate);
        page.btnUpdate.click();
        browser.driver.wait(protractor.until.elementIsVisible(page.viewSyncupdateString));
        expect(page.viewSyncupdateString.getText()).toContain(response);
    });

    it('should open beta syncupdate', function () {
        page.scrollIntoView(page.btnSwitchSyncupdates);
        page.btnSwitchSyncupdates.click();
        expect(browser.getCurrentUrl()).toContain("#/textupdates/multi");
    });

});
