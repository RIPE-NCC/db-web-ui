//var homePage = require('./homePageObject');

describe('webupdates homepage', function() {

    beforeEach(function() {
        browser.get('index.html');
        // Noisy logs enabled here...
        browser.manage().logs().get('browser').then(function(browserLog) {
            console.log('>>>>>> ' + require('util').inspect(browserLog));
        });
    });

    it('should not crash when showing index page', function() {
        expect(element(by.id('searchtext')).isPresent()).toEqual(true);
        expect(element(by.id('nosuch')).isPresent()).toEqual(false);
    });

    it('should redirect to Select object...', function() {
        expect(element(by.id('selectForm')).isPresent()).toEqual(true);
        element(by.cssContainingText('option', 'organisation')).click();
        element(by.css('button[ng-click]')).click();
        expect(element(by.id('createForm')).isPresent()).toEqual(true);
    });

});
