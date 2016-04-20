var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an aut-num', function () {

    describe('which DOES NOT have status APPROVED PI', function () {

        beforeEach(function () {
            browser.get('/#/webupdates/modify/RIPE/aut-num/AS12467');
        });

        it('should show sponsoring-org as read-only', function () {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeFalsy();
        });

    });

    describe('which has status APPROVED PI', function () {

        beforeEach(function () {
            browser.get('/#/webupdates/modify/RIPE/aut-num/AS12467');
        });

        it('should show sponsoring-org as read-only', function () {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);

            // NOT YET MOCKED...
            //expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeTruthy();
        });

    });

});
