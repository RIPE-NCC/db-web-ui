/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Modifying an aut-num', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/webupdates/modify/RIPE/aut-num/AS12467');
    });

    describe('which DOES NOT have status APPROVED PI', function () {

        it('should show sponsoring-org as read-only', function () {
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            expect(page.inpSponsoringOrg.getAttribute('disabled')).toBeFalsy();
        });

        it('should not allow sponsoring-org to be added', function () {
            page.scrollIntoView(page.btnAddAttribute);
            expect(page.inpSponsoringOrg.isPresent()).toEqual(true);
            page.btnAddAttribute.click();
            expect(page.modal.isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, 'descr').isPresent()).toEqual(true);
            expect(page.selectFromList(page.modalAttributeList, 'sponsoring-org').isPresent()).toEqual(false);
        });

    });

});
