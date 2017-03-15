/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The organisation drop-down box', function () {

    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get('');
    });

    it('should be shown when a user has an LIR', function () {
        expect(page.orgSelector.isPresent()).toEqual(true);
        page.orgSelector.click();
        expect (page.orgSelectorOptions.count()).toBe(4);
    });

});
