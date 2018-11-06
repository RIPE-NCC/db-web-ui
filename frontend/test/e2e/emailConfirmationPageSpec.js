/*global beforeEach, browser, by, describe, element, expect, it, require */

/*
 * Tests...
 */
describe('Email Confirmation Page', function () {

    'use strict';

    it('should show successful validation page', function () {
        browser.get(browser.baseUrl + '#/confirmEmail?t=SUCCESS-TOKEN');
        expect(page.checkImg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.getText()).toContain('Thank you! This email has now been validated and we will close the ticket soon. No further action is required.');
    });
    it('should show unsuccessful validation page', function () {
        browser.get(browser.baseUrl + '#/confirmEmail?t=FAILED-TOKEN-EXPIRATION-DATE');
        expect(page.exclamationImg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.isPresent()).toEqual(true);
        expect(page.emailConfirmationMsg.getText()).toContain('Sorry, this link is not valid anymore.');
    });
});

// Local requires
var page = require('./homePageObject');
