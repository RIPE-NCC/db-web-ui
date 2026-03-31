describe('Browser', () => {
    it('should show unsupported page for old browser', () => {
        cy.visit('/', {
            onBeforeLoad: (win) => {
                Object.defineProperty(win.navigator, 'userAgent', {
                    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
                });
            },
        });
        cy.get('h1:contains("Your browser is not supported")').should('be.visible');
    });
});
