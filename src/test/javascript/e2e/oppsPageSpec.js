/*global beforeEach, browser, describe, expect, it, require */
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');


describe('Oops page', function () {


    'use strict';

    beforeEach(function () {
        browser.addMockModule('dbWebAppE2E', mockModule.module);

    });

    it('should go to oops page if the request has an error we cannor handle', function () {
        browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/aut-num/response-with-error');

        expect(element(by.id('oopsMessage')).getText()).toContain('Oops...');
        expect(element(by.id('oopsMessage')).getText()).toContain('We\'re sorry, it looks like something went wrong.');
        expect(element(by.id('oopsMessage')).getText()).toContain('Please try again later and report a bug if the problem persists.');

    });
});
