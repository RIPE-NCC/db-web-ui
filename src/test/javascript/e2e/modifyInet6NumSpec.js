var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an inet6num', function () {

    describe('which DOES NOT have mntner RIPE-NCC-END-MNT', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '/#/webupdates/modify/RIPE/inet6num/2001%3A888%3A2000%3A%3A%2F38');
            browser.addMockModule('dbWebAppE2E', mockModule.module);
        });

        it('should show netname as read-only', function() {
            expect(page.inpNetname.isPresent()).toEqual(true);
            expect(page.inpNetname.getAttribute('disabled')).toBeTruthy();
        });

        it('should show assignment-size as read-only', function () {
            expect(page.inpAssignmentSize.isPresent()).toEqual(true);
            expect(page.inpAssignmentSize.getAttribute('disabled')).toBeTruthy();
        });

    });

    //describe('which has mntner RIPE-NCC-END-MNT', function () {
    //
    //    beforeEach(function () {
    //        browser.get('/#/webupdates/modify/RIPE/aut-num/AS12467');
    //    });
    //
    //    it('should show sponsoring-org as read-only', function () {
    //        expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
    //
    //        // NOT YET MOCKED...
    //        //expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeTruthy();
    //    });
    //
    //});

});

