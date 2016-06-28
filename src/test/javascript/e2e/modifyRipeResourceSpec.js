/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying a resource for a RIPE maintained object', function () {

    beforeEach(function () {
        browser.get(browser.baseUrl + '/#/webupdates/modify/ripe/inetnum/91.208.34.0%20-%2091.208.34.255');
        browser.addMockModule('dbWebAppE2E', mockModule.module);
    });

    it('should show org and sponsoring-org as read-only', function () {
        // org is disabled because object is managed by RIPE
        expect(page.inpOrg.isPresent()).toEqual(true);
        expect(page.inpOrg.getAttribute('disabled')).toBeTruthy();
        expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
        expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeTruthy();
    });

    it('should redirect to the correct url ', function () {

        var originalUrl = browser.baseUrl + '/#/webupdates/modify/ripe/inetnum/91.208.34.0-91.208.34.255';

        urlChanged(originalUrl);

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/webupdates/modify/ripe/inetnum/91.208.34.0%20-%2091.208.34.255');
    });


    var urlChanged = function(url) {
        return function () {
            return browser.getCurrentUrl().then(function(actualUrl) {
                return url != actualUrl;
            });
        };
    };

});
