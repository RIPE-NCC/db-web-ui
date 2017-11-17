/*global beforeEach, browser, by, describe, element, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('Forgot Maintainer Password', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/fmp/change-auth?mntnerKey=TEST-MNT&voluntary=true');
    });

    it('Should load the page with the form', function () {
        expect(page.fmpForm.isPresent()).toEqual(true);
        expect(page.fmpReason.isPresent()).toEqual(true);
        expect(page.fmpEmail.isPresent()).toEqual(true);
        expect(page.fmpNext.isPresent()).toEqual(true);
        expect(page.fmpForm.getText()).toContain('Please give us some information about your request to recover access to the MNTNER object TEST-MNT');
    });

    it('Validate the form', function () {
        page.scrollIntoView(page.fmpNext);
        page.fmpNext.click();
        expect(page.fmpForm.getText()).toContain('Reason is required.');
        expect(page.fmpForm.getText()).toContain('Email is required.');
        page.fmpReason.clear().sendKeys('Some reason');
        page.fmpEmail.clear().sendKeys('test');
        page.fmpNext.click();
        expect(page.fmpForm.getText()).toContain('This is not a valid email.');
        page.fmpEmail.clear().sendKeys('test@test.com');
        page.fmpNext.click();
    });

    it('Go to next page, and generate PDF link', function () {
        page.scrollIntoView(page.fmpNext);
        page.fmpReason.clear().sendKeys('just because');
        page.fmpEmail.clear().sendKeys('person@ripe.net');
        page.fmpNext.click();

        expect(page.fmpStep2.getText()).toContain('Password request for MNTNER TEST-MNT');
        expect(page.fmpStep2.getText()).toContain('Please now print the request form (PDF) on');

        var linkToGeneratedPdf = page.fmpStep2.element(by.id('myPdfLink'));
        expect(linkToGeneratedPdf.isPresent()).toEqual(true);
        expect(linkToGeneratedPdf.getAttribute('href')).toContain('eyJlbWFpbCI6InBlcnNvbkByaXBlLm5ldCIsIm1udG5lcktleSI6IlRFU1QtTU5UIiwicmVhc29uIjoianVzdCBiZWNhdXNlIiwidm9sdW50YXJ5Ijp0cnVlfQ==');

    });

});
