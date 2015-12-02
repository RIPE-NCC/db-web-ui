describe('Webupdates', function() {
    it('should have a title', function() {
        browser.get('https://dev.db.ripe.net/db-web-ui/');

        expect(browser.getTitle()).toEqual('Webupdates — RIPE Network Coordination Centre');
    });
});
