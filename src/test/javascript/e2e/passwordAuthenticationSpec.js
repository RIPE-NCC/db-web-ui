/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The password authentication dialogue', function () {

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module);
        browser.get('/#/webupdates/modify/ripe/aut-num/AS9191');
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should show a single modal which asks for a password', function () {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        expect(page.selectMaintainerDropdown.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuchelement')).isPresent()).toEqual(false);
    });

});
