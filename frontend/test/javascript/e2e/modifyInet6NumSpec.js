/*global beforeEach, browser, describe, expect, it*/
var mockGet = require('./mocks/homemocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an inet6num', function () {

    'use strict';
    browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);

    describe('which is an allocation', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001:999:2000::/36');
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

    describe('which is an assignment', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001:998:2000::/36');
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
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2002:998:2000::%2F36');
        });

        it('should show delete btn', function () {
            expect(page.btnDeleteObject.isPresent()).toEqual(true);
        });

    });
});

