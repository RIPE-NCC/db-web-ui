/*global beforeEach, browser, describe, expect, it*/
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an inet6num', function () {

    'use strict';

    describe('which is an allocation', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001:999:2000::/36');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        it('should show input controls in the correct disabled or enabled state', function() {
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute('disabled')).toBeTruthy();
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute('disabled')).toBeTruthy();
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute('disabled')).toBeTruthy();
        });

        it('should NOT show delete btn', function () {
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });

    });

    describe('which is an end user assignment', function () {

        beforeEach(function () {

            browser.get(browser.baseUrl + '/#/webupdates/modify/ripe/inetnum/91.208.34.0-91.208.34.255');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        it('should NOT show delete btn', function () {
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });

    });

    describe('which is an assignment', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001:998:2000::/36');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });
        it('should show input controls in the correct disabled or enabled state', function() {
            // maintainer input is enabled
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute('disabled')).toBeFalsy();
            // should NOT show netname as read-only
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute('disabled')).toBeFalsy();
            // should show assignment-size as read-only
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute('disabled')).toBeTruthy();
        });

        it('should NOT show delete btn', function () {
            expect(page.btnDeleteObject.isPresent()).toBeFalsy();
        });

    });

    describe('which is an allocated by lir', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2002%3A998%3A2000%3A%3A%2F36');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        it('should show delete btn', function () {
            expect(page.btnDeleteObject.isPresent()).toEqual(true);;
        });

    });
});

