/*global beforeEach, browser, describe, expect, it, require*/
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an organisation', function () {
    'use strict';

    describe('which is an LIR', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '#/webupdates/modify/RIPE/organisation/ORG-AGNS1-RIPE');
        });

        it('should show the mnt-by field as read-only', function () {
            expect(page.inpMaintainer.isPresent()).toEqual(true);
            expect(page.inpMaintainer.getAttribute('disabled')).toBeTruthy();
        });

        it('should show the remarks field starting with hash (#)', function () {
            expect(page.inpRemarks.isPresent()).toEqual(true);
            expect(page.inpRemarks.getAttribute('value')).toEqual('# comment');
        });

        it('should show comment behind value starting with hash (#)', function () {
            expect(page.inpAddress.isPresent()).toEqual(true);
            expect(page.inpAddress.getAttribute('value')).toEqual('Wilhelmina van Pruisenweg 106 # office');
        });
    });

});
