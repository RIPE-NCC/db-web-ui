/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');
var fs = require('fs');

/*
 * This weird test in every it overriding default user json file with other json file - user which contain different
 * privileges (roles).
 * On this way we are able to test if left hand menu containts expected structure of menu items,
 * because for different role is different content in menu.
 */
describe('The left hand menu structure depend on logged in user role', function () {

    'use strict';

    const userInfoFile = './test/e2e/mocks/e2eTest/35076578e970f4e6bca92a8f746671291eec84b0.json';
    const userWithAllRoles = './test/e2e/mocks/e2eTest/user-with-all-role.json';
    const userWithBillingRole = './test/e2e/mocks/e2eTest/user-with-billing-role.json';
    const userWithoutOrgOrLir = './test/e2e/mocks/e2eTest/user-without-org-or-lir.json';
    const userNotLoggedIn = './test/e2e/mocks/e2eTest/user-not-logged-in.json';
    const userGuest = './test/e2e/mocks/e2eTest/user-with-guest-role.json';

    const changeJsonResponsFile = function(file, replacement) {
        fs.readFile(replacement, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            fs.writeFile(file, data, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
    };

    /* RIPE Database structure of menu items
        Query the RIPE Database
        Full Text Search
        Syncupdates
        Create an Object
     */
    const expectRipeDatabaseMenuItemWithAllSubItems = function() {
        page.topMenuItems.get(2).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('RIPE Database');
        });
        page.topMenuItems.get(2).click();
        expect(page.topMenuItems.get(2).all(by.css('.level2 li')).count()).toEqual(4);
        page.ripeDatabaseMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Query the RIPE Database');
        });
        page.ripeDatabaseMenuItems.get(1).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Full Text Search');
        });
        page.ripeDatabaseMenuItems.get(2).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Syncupdates');
        });
        page.ripeDatabaseMenuItems.get(3).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Create an Object');
        });
    };

    afterAll(function() {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
    });

    it('Should show menu structure for user with all role', function () {
        changeJsonResponsFile(userInfoFile, userWithAllRoles);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('My LIR');
        });
        page.topMenuItems.get(1).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('Resources');
        });

        /* My LIR structure of menu items
            LIR Account Details
            Billing Details
            Request Update
            GM Preferences
            User Accounts
            My Tickets
            My Training
            API Access Keys
         */
        page.scrollIntoView(page.topMenuItems.get(0));
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        page.myLirMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('LIR Account Details');
        });
        page.myLirMenuItems.get(1).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Billing Details');
        });
        page.myLirMenuItems.get(2).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Request Update');
        });
        page.myLirMenuItems.get(3).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('GM Preferences');
        });
        page.myLirMenuItems.get(4).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('User Accounts');
        });
        page.myLirMenuItems.get(5).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Tickets');
        });
        page.myLirMenuItems.get(6).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Training');
        });
        page.myLirMenuItems.get(7).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('API Access Keys');
        });

        /* Resource structure of menu items
            My Resources
            Request Resources
            Request Transfer
            IPv4 Transfer Listing Service
            RPKI Dashboard
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(5);
        page.resourcesMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Resources');
        });
        page.resourcesMenuItems.get(1).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Request Resources');
        });
        page.resourcesMenuItems.get(2).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Request Transfer');
        });
        page.resourcesMenuItems.get(3).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('IPv4 Transfer Listing Service');
        });
        page.resourcesMenuItems.get(4).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('RPKI Dashboard');
        });

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('Should show menu structure for user with billing role', function () {
        changeJsonResponsFile(userInfoFile, userWithBillingRole);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('My LIR');
        });
        page.topMenuItems.get(1).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('Resources');
        });

        /* My LIR structure of menu items
            Billing Details
            User Accounts
         */
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        expect(page.myLirMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.myLirMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(4).isDisplayed()).toEqual(true);
        expect(page.myLirMenuItems.get(5).isDisplayed()).toEqual(false);
        page.myLirMenuItems.get(1).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Billing Details');
        });
        page.myLirMenuItems.get(4).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('User Accounts');
        });

        /* Resource structure of menu items
            My Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(5);
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);
        page.resourcesMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Resources');
        });

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('Should show menu structure for user without org or lir', function () {
        changeJsonResponsFile(userInfoFile, userWithoutOrgOrLir);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(1).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('Resources');
        });

        /* Resource structure of menu items
            My Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(5);
        page.resourcesMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Resources');
        });
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('Should show menu structure for no logged in user', function () {
        changeJsonResponsFile(userInfoFile, userNotLoggedIn);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(1).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('Resources');
        });

        /* Resource structure of menu items
            My Resources
         */
        page.topMenuItems.get(1).click();
        expect(page.resourcesMenuItems.count()).toEqual(5);
        page.resourcesMenuItems.get(0).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('My Resources');
        });
        expect(page.resourcesMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.resourcesMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.resourcesMenuItems.get(4).isDisplayed()).toEqual(false);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

    it('Should show menu structure for a guest user', function () {
        changeJsonResponsFile(userInfoFile, userGuest);
        browser.get(browser.baseUrl);
        expect(page.topMenuItems.count()).toEqual(3);
        expect(page.topMenuItems.get(0).isDisplayed()).toEqual(true);
        expect(page.topMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.topMenuItems.get(2).isDisplayed()).toEqual(true);
        page.topMenuItems.get(0).all(by.css('a')).first().getText().then(function(text) {
            expect(text).toBe('My LIR');
        });

        /* Resource structure of menu items
            My LIR
         */
        page.topMenuItems.get(0).click();
        expect(page.myLirMenuItems.count()).toEqual(9);
        page.myLirMenuItems.get(8).element(by.css('a')).getText().then(function(text) {
            expect(text).toBe('Request Acquisition');
        });
        expect(page.myLirMenuItems.get(0).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(1).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(2).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(3).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(4).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(5).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(6).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(7).isDisplayed()).toEqual(false);
        expect(page.myLirMenuItems.get(8).isDisplayed()).toEqual(true);

        expectRipeDatabaseMenuItemWithAllSubItems();
    });

});
