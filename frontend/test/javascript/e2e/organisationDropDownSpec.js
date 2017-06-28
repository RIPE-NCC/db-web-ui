/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The organisation drop-down box', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/myresources/overview');
    });

    it('should be shown when a user has an LIR', function () {
        expect(page.orgSelector.isPresent()).toEqual(true);
        page.orgSelector.click();

        expect (page.orgSelectorOptions.count()).toBe(2);
    });

});
