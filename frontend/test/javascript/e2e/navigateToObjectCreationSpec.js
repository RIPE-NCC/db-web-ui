/*global by, beforeEach, browser, describe, element, expect, it, require */
var mockGet = require('./mocks/homemocks');
var mockModule = require('./mocks/mockModule');
var page = require('./homePageObject');

describe('webupdates homepage', function() {

    'use strict';

    beforeEach(function() {
        browser.addMockModule('dbWebAppE2E', mockModule.module, mockGet);
        browser.get(browser.baseUrl);
        // Noisy logs enabled here...
        // browser.manage().logs().get('browser').then(function(browserLog) {
        //    console.log('>>>>>> ' + require('util').inspect(browserLog));
        // });
    });

    it('should not crash when showing index page', function() {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuchelement')).isPresent()).toEqual(false);
    });

    it('should show an editor for as-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('as-set').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "as-set" object');
    });

    it('should show an editor for aut-num', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('aut-num').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "aut-num" object');
    });

    it('should show an editor for filter-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('filter-set').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "filter-set" object');
    });

    it('should show an editor for inet6num', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inet6num').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inet6num" object');
        page.inpInet6num.sendKeys('2001:888:2000::/38');
        page.scrollIntoView(page.inpStatusLink); // bring 'status' into view
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(2);
        expect(page.inpStatusList.get(0).getText()).toEqual('AGGREGATED-BY-LIR');
        expect(page.inpStatusList.get(1).getText()).toEqual('ASSIGNED');
    });

    it('should show an editor for inet-rtr', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inet-rtr').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inet-rtr" object');
    });

    it('should show an editor for irt', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('irt').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "irt" object');
    });

    it('should show an editor for key-cert', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('key-cert').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "key-cert" object');
    });

    it('should show an editor for mntner', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('mntner').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "mntner" object');
    });

    it('should show an editor for organisation', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('organisation').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "organisation" object');
    });

    it('should show an editor for peering-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('peering-set').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "peering-set" object');
    });

    it('should show an editor for person', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('person').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "person" object');
    });

    it('should show an editor for role', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('role').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "role" object');
    });

    it('should show an editor for route', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('route').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "route" object');
    });

    it('should show an editor for route6', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('route6').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "route6" object');
    });

    it('should show an editor for route-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('route-set').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "route-set" object');
    });

    it('should show an editor for rtr-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('rtr-set').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "rtr-set" object');
    });

});
