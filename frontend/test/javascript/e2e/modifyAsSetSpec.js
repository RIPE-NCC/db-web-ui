/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

describe('Deleting an as-set', function () {

    'use strict';

    beforeEach(function () {
    });

    it('should properly close the reason modal', function () {
        browser.get(browser.baseUrl + '#/webupdates/modify/ripe/as-set/AS196613%253AAS-TEST');
        page.scrollIntoView(page.btnDeleteObject);
        page.btnDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(true);
        page.btnConfirmDeleteObject.click();
        expect(page.modal.isPresent()).toEqual(false);
    });

});
