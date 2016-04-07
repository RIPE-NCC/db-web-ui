/*global beforeEach, browser, describe, expect, it, require */
var page = require('./homePageObject');

describe('webupdates homepage', function() {

    beforeEach(function() {
        browser.get('index.html');
        // Noisy logs enabled here...
        browser.manage().logs().get('browser').then(function(browserLog) {
            console.log('>>>>>> ' + require('util').inspect(browserLog));
        });
    });

    it('should not crash when showing index page', function() {
        expect(page.searchTextInput.isPresent()).toEqual(true);
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        expect(element(by.id('nosuch')).isPresent()).toEqual(false);
    });

    it('should show an editor for as-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('as-set').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "as-set" object');
    });

    it('should show an editor for aut-num', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('aut-num').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "aut-num" object');
    });

    it('should show an editor for domain', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('domain').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "domain" object');
    });

    it('should show an editor for filter-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('filter-set').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "filter-set" object');
    });

    it('should show an editor for inet6num', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inet6num').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inet6num" object');
    });

    it('should show an editor for inetnum', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inetnum').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inetnum" object');
    });

    it('should show an editor for inet-rtr', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inet-rtr').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inet-rtr" object');
    });

    it('should show an editor for irt', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('irt').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "irt" object');
    });

    it('should show an editor for key-cert', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('key-cert').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "key-cert" object');
    });

    it('should show an editor for mntner', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('mntner').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "mntner" object');
    });

    it('should show an editor for organisation', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('organisation').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "organisation" object');
    });

    it('should show an editor for peering-set', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('peering-set').click();
        page.createButton.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "peering-set" object');
    });

});
