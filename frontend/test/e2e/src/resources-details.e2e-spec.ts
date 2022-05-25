import { browser, by } from 'protractor';
import { waitToBeClickable } from './fixtures';

const page = require('./homePageObject');

describe('Resources detail', () => {
    beforeEach(() => {
        page.navigateTo(browser.baseUrl);
        browser.manage().addCookie({ name: 'activeMembershipId', value: '3629', path: '/' });
    });

    describe('for an ASSIGNED PI inetnum', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/');
        });

        it('should show whois object attributes', async () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();

            const showMoreButton = whoisObject.showMoreButton();
            expect(showMoreButton.isPresent()).toEqual(false);

            expect(whoisObject.isPresent()).toEqual(true);
            expect(attributes.count()).toEqual(14);
            expect(attributes.get(0).getText()).toMatch(/inetnum: *192\.87\.0\.0 - 192\.87\.255\.255/);
            expect(attributes.get(1).getText()).toMatch(/netname: *RU-1C-20160322/);

            expect(attributes.get(2).getText()).toMatch(/descr: *first line of description # comment/);

            expect(attributes.get(3).getText()).toMatch(/country: *FI/);
            expect(attributes.get(4).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
            expect(attributes.get(5).getText()).toMatch(/sponsoring-org: *ORG-LA538-RIPE/);
            expect(attributes.get(6).getText()).toMatch(/admin-c: *MV10039-RIPE/);
            expect(attributes.get(7).getText()).toMatch(/tech-c: *inty1-ripe/);
            expect(attributes.get(8).getText()).toMatch(/status: *ASSIGNED PI/);
            expect(attributes.get(9).getText()).toMatch(/mnt-by: *TPOL888-MNT/);
            expect(attributes.get(10).getText()).toMatch(/remarks: *# should show remarks starting with hash/);
            expect(attributes.get(11).getText()).toMatch(/created: *2016-03-22T13:48:02Z/);
            expect(attributes.get(12).getText()).toMatch(/last-modified: *2016-04-26T14:28:28Z/);
            expect(attributes.get(13).getText()).toMatch(/source:( *)RIPE/);

            const ripeStatButton = page.getWhoisObject().showRipeStatButton();
            expect(ripeStatButton.isPresent()).toEqual(true);
            const url = ripeStatButton.getAttribute('href');
            expect(url).toEqual('https://stat.ripe.net/192.87.0.0%20-%20192.87.255.255?sourceapp=ripedb');

            expect(page.moreSpecificsTable.isPresent()).toEqual(true);
            expect(page.moreSpecificsTableRows.count()).toEqual(2);

            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('192.87.0.0/24');
            // contain href in a tag what guarantees option "Open in new tab" in context menu
            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).element(by.css('a')).getAttribute('href')).toContain(
                'myresources/detail/inetnum/192.87.0.0%20-%20192.87.0.255/false',
            );
            expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('LEGACY');
            expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('SNET-HOMELAN');

            expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('192.87.1.0/24');
            expect(page.getTableCell(page.moreSpecificsTable, 1, 0).element(by.css('a')).getAttribute('href')).toContain(
                'myresources/detail/inetnum/192.87.1.0%20-%20192.87.1.255/false',
            );
            expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('LEGACY');
            expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('NFRA');

            expect(page.btn1HierarchySelector.isPresent()).toEqual(true);
            expect(page.btn2HierarchySelector.isPresent()).toEqual(true);

            const firstCellInTable = page.getContentInTableCell(page.getTableCell(page.moreSpecificsTable, 0, 0), 'a');
            await page.scrollIntoCenteredView(firstCellInTable);
            firstCellInTable.click();
            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('192.87.0.80/28');
            expect(page.btn1HierarchySelector.isPresent()).toEqual(true);
            expect(page.btn2HierarchySelector.isPresent()).toEqual(true);
        });

        it('should not display address usage', () => {
            expect(page.usageStatus.isPresent()).toEqual(false);
        });

        it('should show the remarks field starting with hash (#)', () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();
            expect(attributes.get(10).getText()).toMatch(/remarks: *# should show remarks starting with hash/);
        });

        it('should show comment behind value starting with hash (#)', () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();
            expect(attributes.get(2).getText()).toMatch(/descr: *first line of description # comment/);
        });
    });

    describe('for inetnum with flags', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/inetnum/185.51.48.0%20-%20185.51.55.255/false');
        });

        it('should contain 8 flags, 2 tickets and 2 dates', () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(8);
            expect(page.flags.get(2).getText()).toEqual('2014-03-21');
            expect(page.flags.get(3).getText()).toEqual('NCC#2014033634');
            expect(page.flags.get(4).getText()).toEqual('2014-03-21');
            expect(page.flags.get(5).getText()).toEqual('NCC#2014033636');
            expect(page.flags.get(6).getText()).toEqual('IRR');
            expect(page.flags.get(7).getText()).toEqual('rDNS');
        });

        it('should contain Associated Route Objects table', () => {
            expect(page.associatedRouteObjectsTable.isPresent()).toEqual(true);
            expect(page.associatedRouteObjectsTableRows.count()).toEqual(3);

            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 0).getText()).toEqual('AS8100');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS8100&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 1).getText()).toEqual('185.51.49.0/24');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 1, 0).getText()).toEqual('AS41108');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 1, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS41108&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 1, 1).getText()).toEqual('185.51.50.0/24');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 0).getText()).toEqual('AS41108');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS41108&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 1).getText()).toEqual('185.51.51.0');
        });

        it('should contain Associated Domain Objects table', () => {
            expect(page.associatedDomainObjectsTable.isPresent()).toEqual(true);
            expect(page.associatedDomainObjectsTableRows.count()).toEqual(3);

            expect(page.getTableCell(page.associatedDomainObjectsTable, 0, 0).getText()).toEqual('49.51.185.in-addr.arpa');
            expect(page.getTableCell(page.associatedDomainObjectsTable, 0, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=49.51.185.in-addr.arpa&type=domain',
            );
            expect(page.getTableCell(page.associatedDomainObjectsTable, 0, 1).getText()).toEqual('Manage');
            expect(page.getTableCell(page.associatedDomainObjectsTable, 0, 1).element(by.css('a')).getAttribute('href')).toContain(
                'webupdates/modify/RIPE/domain/49.51.185.in-addr.arpa',
            );
            expect(page.getTableCell(page.associatedDomainObjectsTable, 1, 0).getText()).toEqual('50.51.185.in-addr.arpa');
            expect(page.getTableCell(page.associatedDomainObjectsTable, 1, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=50.51.185.in-addr.arpa&type=domain',
            );
            expect(page.getTableCell(page.associatedDomainObjectsTable, 2, 0).getText()).toEqual('51.51.185.in-addr.arpa');
            expect(page.getTableCell(page.associatedDomainObjectsTable, 2, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=51.51.185.in-addr.arpa&type=domain',
            );
        });
    });

    describe('for inetnum with usage status', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/inetnum/194.171.0.0%20-%20194.171.255.255/');
        });

        it('should display address usage', () => {
            expect(page.usageStatus.isPresent()).toEqual(true);
            expect(page.usageStatusStatistics.count()).toEqual(2);
            expect(page.usageStatusStatistics.get(0).getText()).toEqual('80%');
            expect(page.usageStatusStatistics.get(1).getText()).toEqual('20%');
        });

        it('should contain 2 flags, 0 tickets and 0 dates', () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(2);
        });
    });

    describe('for inet6num', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/inet6num/2001:7f8::%2F29/');
        });

        it('should show whois object attributes', () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();

            const showMoreButton = whoisObject.showMoreButton();
            expect(showMoreButton.isPresent()).toEqual(false);

            expect(whoisObject.isPresent()).toEqual(true);
            expect(attributes.count()).toEqual(15);
            expect(attributes.get(0).getText()).toMatch(/inet6num: *2001:7f8::\/29/);
            expect(attributes.get(1).getText()).toMatch(/netname: *EU-ZZ-2001-07F8/);
            expect(attributes.get(2).getText()).toMatch(/org: *ORG-NCC1-RIPE/);
            expect(attributes.get(3).getText()).toMatch(/descr: *RIPE Network Coordination Centre/);
            expect(attributes.get(4).getText()).toMatch(/descr: *block for RIR assignments/);
            expect(attributes.get(13).getText()).toMatch(/last-modified: *2011-12-30T07:49:39Z/);
            expect(attributes.get(14).getText()).toMatch(/source: *RIPE/);

            expect(page.moreSpecificsTable.isPresent()).toEqual(true);
            expect(page.moreSpecificsTableRows.count()).toEqual(2);

            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual('2001:7f8::/48');
            expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual('ASSIGNED PI');
            expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual('DE-CIX-IXP-20010913');

            expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual('2001:7f8:1::/48');
            expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual('ASSIGNED PI');
            expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual('AMS-IX-20010913');

            // filtering content in table text about number of items in table should change
            expect(page.numberOfMoreSpecific.getText()).toEqual('Total more specifics:');
            page.filterOfMoreSpecific.sendKeys('nooo');
            expect(page.numberOfMoreSpecific.getText()).toEqual('Showing 0 out of 2');
            page.filterOfMoreSpecific.clear();
        });
    });

    describe('for aut-num with loads of attributes', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/aut-num/AS204056/');
        });

        it('should show a partial view that can be expanded', async () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();

            const showMoreButton = whoisObject.showMoreButton();
            expect(showMoreButton.isPresent()).toEqual(true);

            expect(whoisObject.isPresent()).toEqual(true);
            expect(attributes.count()).toEqual(25);
            expect(attributes.get(0).getText()).toMatch(/aut-num: *AS204056/);
            expect(attributes.get(1).getText()).toMatch(/as-name: *asnametest/);
            expect(attributes.get(2).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
            expect(attributes.get(3).getText()).toMatch(/import: *from AS3254 accept ANY/);
            expect(attributes.get(4).getText()).toMatch(/export: *to AS3254 announce AS204056/);
            expect(attributes.get(5).getText()).toMatch(/import: *from as3333 accept ANY/);
            expect(attributes.get(6).getText()).toMatch(/export: *to as3333 announce AS204056/);
            expect(attributes.get(7).getText()).toMatch(/admin-c: *MV10039-RIPE/);
            expect(attributes.get(8).getText()).toMatch(/tech-c: *inty1-ripe/);
            expect(attributes.get(9).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(10).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(11).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(12).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(13).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(14).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(15).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(16).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(17).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(18).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(19).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(20).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(21).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(22).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(23).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(24).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );

            expect(whoisObject.isPresent()).toEqual(true);
            expect(whoisObject.showMoreButton().isPresent()).toEqual(true);

            expect(attributes.count()).toEqual(25);

            await page.scrollIntoCenteredView(whoisObject.showMoreButton());
            whoisObject.showMoreButton().click();
            expect(whoisObject.isPresent()).toEqual(true);
            expect(whoisObject.showMoreButton().isPresent()).toEqual(false);
            expect(attributes.count()).toEqual(62);

            expect(attributes.get(0).getText()).toMatch(/aut-num: *AS204056/);
            expect(attributes.get(1).getText()).toMatch(/as-name: *asnametest/);
            expect(attributes.get(2).getText()).toMatch(/org: *ORG-EIP1-RIPE/);
            expect(attributes.get(3).getText()).toMatch(/import: *from AS3254 accept ANY/);
            expect(attributes.get(4).getText()).toMatch(/export: *to AS3254 announce AS204056/);
            expect(attributes.get(5).getText()).toMatch(/import: *from as3333 accept ANY/);
            expect(attributes.get(6).getText()).toMatch(/export: *to as3333 announce AS204056/);
            expect(attributes.get(7).getText()).toMatch(/admin-c: *MV10039-RIPE/);
            expect(attributes.get(8).getText()).toMatch(/tech-c: *inty1-ripe/);
            expect(attributes.get(9).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(10).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(11).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            //Same... :/
            expect(attributes.get(53).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(54).getText()).toMatch(
                /remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/,
            );
            expect(attributes.get(55).getText()).toMatch(/status: *ASSIGNED/);
            expect(attributes.get(56).getText()).toMatch(/mnt-by: *RIPE-NCC-END-MNT/);
            expect(attributes.get(57).getText()).toMatch(/mnt-by: *RU1C-MNT/);
            expect(attributes.get(58).getText()).toMatch(/mnt-routes: *RU1C-MNT/);
            expect(attributes.get(59).getText()).toMatch(/created: *2016-03-22T13:43:48Z/);
            expect(attributes.get(60).getText()).toMatch(/last-modified: *2017-03-23T12:08:46Z/);
            expect(attributes.get(61).getText()).toMatch(/source: *RIPE/);

            expect(page.moreSpecificsTable.isPresent()).toEqual(false);
        });

        it('should contain 4 flags, 1 ticket and 1 date, and IRR and rDNS should be on end', () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(6);
            expect(page.flags.get(2).getText()).toEqual('2017-06-19');
            expect(page.flags.get(3).getText()).toEqual('NCC#201001020355');
            expect(page.flags.get(4).getText()).toEqual('IRR');
            expect(page.flags.get(5).getText()).toEqual('rDNS');
        });

        it('should contain Associated Route Objects table', () => {
            expect(page.associatedRouteObjectsTable.isPresent()).toEqual(true);
            expect(page.associatedRouteObjectsTableRows.count()).toEqual(6);

            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 0).getText()).toEqual('AS204056');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS204056&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 1).getText()).toEqual('131.115.0.0/16');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 2).getText()).toEqual('Manage');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 0, 2).element(by.css('a')).getAttribute('href')).toContain(
                'webupdates/modify/RIPE/associated-route/131.115.0.0%2F16AS204056',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 0).getText()).toEqual('AS204056');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS204056&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 2, 1).getText()).toEqual('192.43.165.0/24');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 5, 0).getText()).toEqual('AS204056');
            expect(page.getTableCell(page.associatedRouteObjectsTable, 5, 0).element(by.css('a')).getAttribute('href')).toContain(
                'lookup?source=RIPE&key=AS204056&type=aut-num',
            );
            expect(page.getTableCell(page.associatedRouteObjectsTable, 5, 1).getText()).toEqual('192.150.84.0/24');
        });
    });

    describe('for out of region aut-num', () => {
        beforeEach(() => {
            page.navigateTo(browser.baseUrl + 'myresources/detail/aut-num/AS36867/');
        });

        it('should show out of region aut-num', () => {
            let whoisObject = page.getWhoisObject();
            let attributes = whoisObject.attributes();
            expect(whoisObject.isPresent()).toEqual(true);
            expect(attributes.count()).toEqual(11);
            expect(attributes.get(0).getText()).toMatch(/aut-num: *AS36867/);
            expect(attributes.get(1).getText()).toMatch(/as-name: *Kokonet-BGP/);
            expect(attributes.get(2).getText()).toMatch(/descr: *Kokonet Ltd Seychelles ISP/);
            expect(attributes.get(3).getText()).toMatch(/org: *ORG-Sb3-RIPE/);
            expect(attributes.get(4).getText()).toMatch(/admin-c: *SNS1-RIPE/);
            expect(attributes.get(5).getText()).toMatch(/tech-c: *JK9622-RIPE/);
            expect(attributes.get(6).getText()).toMatch(/status: *OTHER/);
            expect(attributes.get(10).getText()).toMatch(/source: *RIPE-NONAUTH/);
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(0).getAttribute('href')).toContain('?source=ripe-nonauth&key=AS36867&type=aut-num');
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(3).getAttribute('href')).toContain(
                '?source=ripe-nonauth&key=ORG-Sb3-RIPE&type=organisation',
            );
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(4).getAttribute('href')).toContain('?source=ripe-nonauth&key=SNS1-RIPE&type=role');
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(5).getAttribute('href')).toContain('?source=ripe-nonauth&key=JK9622-RIPE&type=person');
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(7).getAttribute('href')).toContain('?source=ripe-nonauth&key=KOKONET-MNT&type=mntner');
        });

        it('should edit and update out of region aut-num', async () => {
            await page.disableLiveChat();
            await page.scrollIntoCenteredView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            await page.scrollIntoCenteredView(page.modalInpPassword);
            page.modalInpPassword.sendKeys('KOKONET-MNT');
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.inpDescr.isPresent()).toBe(true);
            page.inpDescr.sendKeys('Updated test description');
            page.btnAddAnAttribute(page.inpDescr).click();
            await page.scrollIntoCenteredView(page.modal);
            page.modalBtnSubmit.click();

            expect(page.inpDescr2.isPresent()).toBe(true);
            await waitToBeClickable(page.btnRemoveAttribute(page.inpDescr2));
            page.btnRemoveAttribute(page.inpDescr2).click();
            expect(page.inpDescr2.isPresent()).toBe(false);

            // source field should be disabled
            expect(page.woeSource.getAttribute('disabled')).toBeTruthy();

            await page.scrollIntoCenteredView(page.btnSubmitObject);
            page.btnSubmitObject.click();
            expect(page.successMessage.isPresent()).toBe(true);
        });

        it('should contain 2 flags', () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(2);
            expect(page.flags.get(0).getText()).toEqual('OTHER');
            expect(page.flags.get(1).getText()).toEqual('Kokonet-BGP');
        });
    });
});
