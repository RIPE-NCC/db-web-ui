describe('angularjs homepage', function() {
    it('should not crash', function() {
        browser.get('http://localhost:9000/index_test.html');

        var el = element(by.id('xxx'));

        expect(el).not.toBe(null);
        expect('this test').toEqual('a failed test');

    });

});
