/*global beforeEach, browser, by, describe, element, expect, it, require */

// Local requires
var mockGet = require('./mocks/mocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The domain wizard', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '/#/webupdates/wizard/RIPE/domain');
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should show an editor for domain', function() {
        expect(page.heading.getText()).toEqual('Create "domain" objects');
    });

});
