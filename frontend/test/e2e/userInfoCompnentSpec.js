/*global beforeEach, browser, describe, expect, inject, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The user info component', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/fulltextsearch');
    });

    it('should redirect to query page after Logout', function () {
        expect(page.userInfoMenu.isDisplayed()).toEqual(false);
        expect(page.userInfo.isPresent()).toEqual(true);
        page.userInfo.click();
        expect(page.userInfoMenu.isDisplayed()).toEqual(true);
        // https://access.prepdev.ripe.net/logout?originalUrl=http://localhost:9002/#/query
        expect(page.userInfoLogoutLink.getAttribute('href')).toContain("https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/#query");
    });

});
