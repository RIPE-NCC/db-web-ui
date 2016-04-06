describe('webupdates homepage', function() {

    it('should not crash', function() {
        browser.get('index.html');
        browser.manage().logs().get('browser').then(function(browserLog) {
            console.log('log: ' + require('util').inspect(browserLog));
        });
        expect(element(by.id('searchtext')).isPresent()).toEqual(true);
        expect(element(by.id('nosuch')).isPresent()).toEqual(false);
    });

});
