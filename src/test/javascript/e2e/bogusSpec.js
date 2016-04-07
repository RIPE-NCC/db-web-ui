/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

describe('webupdates homepage', function() {

    beforeEach(function() {
        browser.get('index.html');
        // Noisy logs enabled here...
        browser.manage().logs().get('browser').then(function(browserLog) {
            console.log('>>>>>> ' + require('util').inspect(browserLog));
        });
    });

    it('should not crash when showing index page', function() {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuch')).isPresent()).toEqual(false);
    });

    it('should redirect to Select object...', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('organisation').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
    });

});
