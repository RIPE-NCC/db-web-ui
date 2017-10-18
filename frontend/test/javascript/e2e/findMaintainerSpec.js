/*global beforeEach, browser, by, describe, element, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Find Maintainer', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/fmp/');
    });

    it('Should load the page with the search form', function () {
        expect(page.findMaintainerForm.isPresent()).toEqual(true);
        expect(page.searchMaintainer.isPresent()).toEqual(true);
        expect(page.searchMaintainer.getText()).toEqual('Search');
        expect(page.searchMaintainerCancel.isPresent()).toEqual(true);
        expect(page.searchMaintainerCancel.getText()).toEqual('Cancel');
        expect(page.inputMaintainer.isPresent()).toEqual(true);
        expect(page.maintainerContainer.isPresent()).toEqual(false);
    });

    it('Should load the maintainer into page after search', function () {
        expect(page.maintainerContainer.isPresent()).toEqual(false);
        page.scrollIntoView(page.findMaintainerForm);
        page.inputMaintainer.clear().sendKeys('shryane-mnt');
        page.searchMaintainer.click();
        expect(page.maintainerContainer.isPresent()).toEqual(true);

        var maintainerContainer = page.maintainerContainer.getText();
        expect(maintainerContainer).toContain('Please check that this is the correct object before proceeding.');
        expect(maintainerContainer).toContain('SHRYANE-MNT');
        expect(maintainerContainer).toContain('ES7554-RIPE');
        expect(maintainerContainer).toContain('eshryane@ripe.net');
        expect(maintainerContainer).toContain('2013-12-10T16:55:06Z');
        expect(maintainerContainer).toContain('2016-10-11T14:51:12Z');
        expect(maintainerContainer).toContain('RIPE');
        expect(maintainerContainer).toContain('An email containing further instructions will be sent to the address eshryane@ripe.net.');
        expect(maintainerContainer).toContain('I have access to eshryane@ripe.net. Take me to the automated recovery process');
        expect(maintainerContainer).toContain('I do not have access to . Take me to the manual recovery process');
    });

});
