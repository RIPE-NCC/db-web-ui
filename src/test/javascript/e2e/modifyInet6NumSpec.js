var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an inet6num', function () {

    describe('which is an allocation', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001%3A999%3A2000%3A%3A%2F36');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        fit('should show mntner box as read-only', function() {
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute('disabled')).toBeTruthy();
        });

        fit('should show netname as read-only', function() {
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute('disabled')).toBeTruthy();
        });

        fit('should show assignment-size as read-only', function () {
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute('disabled')).toBeTruthy();
        });

    });

    describe('which is an assignment', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001%3A998%3A2000%3A%3A%2F36');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });
        fit('should NOT show mntner box as read-only', function() {
            expect(page.inpMntnerBox.isPresent()).toEqual(true);
            expect(page.inpMntnerBox.getAttribute('disabled')).toBeFalsy();
        });

        fit('should NOT show netname as read-only', function() {
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute('disabled')).toBeFalsy();
        });

        fit('should show assignment-size as read-only', function () {
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute('disabled')).toBeTruthy();
        });

    });

});

