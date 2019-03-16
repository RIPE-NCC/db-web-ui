/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');

/*
 * Tests...
 */
describe('The inetnum editor', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
    });

    /*

     VERSION BUILD=844 RECORDER=CR
     URL GOTO=http://localhost.ripe.net:9002/#/webupdates/create/RIPE/inetnum
     TAG POS=1 TYPE=INPUT:TEXT FORM=ID:createForm ATTR=NAME:inetnum CONTENT=213.159.160.0-213.159.190.255
     SET !ENCRYPTION NO
     TAG POS=1 TYPE=INPUT:PASSWORD FORM=NAME:NoFormName ATTR=* CONTENT=ERICSSON-MNT
     TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:NoFormName ATTR=ID:associate CONTENT=NO
     TAG POS=3 TYPE=INPUT:SUBMIT FORM=NAME:NoFormName ATTR=*
     TAG POS=1 TYPE=INPUT:TEXT FORM=ID:createForm ATTR=NAME:netname CONTENT=bogus-netname1
     TAG POS=1 TYPE=INPUT:TEXT FORM=ID:createForm ATTR=NAME:admin-c CONTENT=aa1-ripe
     TAG POS=1 TYPE=INPUT:TEXT FORM=ID:createForm ATTR=NAME:tech-c CONTENT=aa1-ripe
     TAG POS=2 TYPE=SPAN ATTR=TXT:Specifies<SP>the<SP>kind<SP>of<SP>resource.
     TAG POS=2 TYPE=DIV ATTR=TXT:ASSIGNED<SP>PA
     TAG POS=2 TYPE=SPAN ATTR=TXT:Identifies<SP>the<SP>country<SP>as<SP>a<SP>two-letter<SP>ISO*
     TAG POS=4 TYPE=INPUT:TEXT FORM=ID:createForm ATTR=* CONTENT=nl
     TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:createForm ATTR=*
     TAG POS=2 TYPE=DIV ATTR=TXT:Netherlands<SP>[NL]

     */
    it('should ask for authentication of parent inetnum', function () {
        page.selectObjectType('inetnum').click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys('213.159.160.0-213.159.190.255');
        page.scrollIntoView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys('ERICSSON-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        page.inpNetname.sendKeys('bogus-netname1');
        page.scrollIntoView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys('aa1-ripe');
        page.inpTechC.sendKeys('aa1-ripe');
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain('ASSIGNED PA');
        expect(page.inpStatusList.get(1).getText()).toContain('LIR-PARTITIONED PA');
        expect(page.inpStatusList.get(2).getText()).toContain('SUB-ALLOCATED PA');
        page.scrollIntoView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should be available
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeFalsy();
    });

    it('should ask for authentication of parent inetnum and handle a bad password properly', function () {
        page.selectObjectType('inetnum').click();
        page.btnNavigateToCreate.click();
        page.inpInetnum.sendKeys('213.159.160.0-213.159.190.255');
        page.scrollIntoView(page.inpNetname);
        page.inpNetname.click();
        page.modalInpPassword.sendKeys('xxx');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modalBody.getText()).toContain('You have not supplied the correct password for mntner');
        page.scrollIntoView(page.modalClose);
        page.modalClose.click();
        expect(page.modal.isPresent()).toBe(false);
        page.inpNetname.sendKeys('bogus-netname1');
        page.scrollIntoView(page.inpCountry); // let's have a look at that link
        page.inpCountry.click();
        page.inpCountryList.get(2).click();
        page.inpAdminC.sendKeys('aa1-ripe');
        page.inpTechC.sendKeys('aa1-ripe');
        page.inpAdminC.click();
        page.scrollIntoView(page.inpStatusLink); // let's have a look at that link
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(3);
        expect(page.inpStatusList.get(0).getText()).toContain('ASSIGNED PA');
        expect(page.inpStatusList.get(1).getText()).toContain('LIR-PARTITIONED PA');
        expect(page.inpStatusList.get(2).getText()).toContain('SUB-ALLOCATED PA');
        page.scrollIntoView(page.inpStatusList.get(0));
        expect(page.inpStatusList.get(0).click());
        // submit button should NOT be available
        expect(page.btnSubmitForm.getAttribute('disabled')).toBeTruthy();
    });

    it('should show an editor for inet6num', function() {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType('inet6num').click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual('Create "inet6num" object');
        page.inpInet6num.sendKeys('2001:888:2000::/38\t');
        browser.wait(function () {
            return browser.isElementPresent(page.modalBtnSubmit);
        }, 5000);
        page.modalInpAssociate.click();
        page.modalInpPassword.sendKeys('XS4ALL-MNT');
        page.modalBtnSubmit.click();

        page.scrollIntoView(page.inpStatusLink); // bring 'status' into view
        page.inpStatusLink.click(); // click on dropdown to populate it.
        expect(page.inpStatusList.count()).toBe(2);
        expect(page.inpStatusList.get(0).getText()).toEqual('AGGREGATED-BY-LIR');
        expect(page.inpStatusList.get(1).getText()).toEqual('ASSIGNED');
    });

});
