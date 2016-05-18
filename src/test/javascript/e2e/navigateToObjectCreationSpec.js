/*global beforeEach, browser, describe, expect, it, require */
var mockModule = require('./mocks/homepagemocks');
var page = require('./homePageObject');

describe('webupdates homepage', function() {

    beforeEach(function() {
        browser.get('index.html');
        browser.addMockModule('dbWebAppE2E', mockModule.module);
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

    it('should show an editor for domain', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('domain').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "domain" object');
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
        page.inpInet6num.sendKeys('2001:888:2000::/36');
        page.scrollIntoView(page.inpStatusLink); // bring 'status' into view
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(6);
        expect(page.inpStatusList.get(0).getText()).toEqual('AGGREGATED-BY-LIR');
        expect(page.inpStatusList.get(1).getText()).toEqual('ALLOCATED-BY-LIR');
        expect(page.inpStatusList.get(2).getText()).toEqual('ALLOCATED-BY-RIR');
        expect(page.inpStatusList.get(3).getText()).toEqual('ASSIGNED');
        expect(page.inpStatusList.get(4).getText()).toEqual('ASSIGNED ANYCAST');
        expect(page.inpStatusList.get(5).getText()).toEqual('ASSIGNED PI');
    });

    fit('should show an editor for inetnum', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inetnum').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inetnum" object');
        expect(page.inpStatusLink.getText()).toEqual('Specifies the kind of resource.');
        //page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        //page.inpStatusLink.click(); // click on dropdown to populate it.
        //expect(page.inpStatus.isPresent()).toEqual(true);
        //page.inpInetnum.click();
        //page.inpInetnum.sendKeys('193.0.4.0 - 193.0.4.255');
        //page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        //page.inpStatusLink.click(); // click on dropdown to populate it.
        //expect(page.inpStatusList.count()).toBe(0);
        //expect(page.inpStatusList.get(0).getText()).toEqual('ALLOCATED PA');
        //
        page.inpInetnum.sendKeys('213.159.160.0 - 213.159.190.255');
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toEqual('ASSIGNED PA');
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
