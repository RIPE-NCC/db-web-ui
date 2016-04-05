describe('webupdates homepage', function() {

    it('should not crash', function() {
        browser.get('http://localhost:9000/index.html');
        expect(element(by.id('searchtext')).isPresent()).toEqual(true);
        expect(element(by.id('nosuch')).isPresent()).toEqual(true);
        expect('this test').toEqual('a failed test');
    });

});
