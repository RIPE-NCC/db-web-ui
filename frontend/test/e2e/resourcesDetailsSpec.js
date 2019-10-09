// Local requires
const page = require("./homePageObject");

describe("Resources detail", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
        browser.manage().addCookie({name: "activeMembershipId", value: "3629", path: "/"});
    });

    describe("for an ASSIGNED PI inetnum", () => {
        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/");
        });

        it("should show whois object attributes", () => {

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
            const url = ripeStatButton.getAttribute("href");
            expect(url).toEqual("https://stat.ripe.net/192.87.0.0%20-%20192.87.255.255?sourceapp=ripedb");

            expect(page.moreSpecificsTable.isPresent()).toEqual(true);
            expect(page.moreSpecificsTableRows.count()).toEqual(2);

            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual("192.87.0.0/24");
            expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual("LEGACY");
            expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual("SNET-HOMELAN");

            expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual("192.87.1.0/24");
            expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual("LEGACY");
            expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual("NFRA");

            expect(page.btn1HierarchySelector.isPresent()).toEqual(true);
            expect(page.btn2HierarchySelector.isPresent()).toEqual(true);

            const firstCellInTable = page.getContentInTableCell(page.getTableCell(page.moreSpecificsTable, 0, 0), "a");
            page.scrollIntoView(firstCellInTable);
            firstCellInTable.click();
            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual("192.87.0.80/28");
            expect(page.btn1HierarchySelector.isPresent()).toEqual(true);
            expect(page.btn2HierarchySelector.isPresent()).toEqual(true);

        });

        it("should not display address usage", () => {
            expect(page.usageStatus.isPresent()).toEqual(false);
        });

        it("should show the remarks field starting with hash (#)", () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();
            expect(attributes.get(10).getText()).toMatch(/remarks: *# should show remarks starting with hash/);
        });

        it("should show comment behind value starting with hash (#)", () => {
            const whoisObject = page.getWhoisObject();
            const attributes = whoisObject.attributes();
            expect(attributes.get(2).getText()).toMatch(/descr: *first line of description # comment/);
        });
    });

    describe("for inetnum with flags", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/inetnum/185.51.48.0%20-%20185.51.55.255/false");
        });

        it("should contain 6 flags, 2 tickets and 2 dates", () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(6);
            expect(page.flags.get(2).getText()).toEqual("2014-03-21");
            expect(page.flags.get(3).getText()).toEqual("NCC#2014033634");
            expect(page.flags.get(4).getText()).toEqual("2014-03-21");
            expect(page.flags.get(5).getText()).toEqual("NCC#2014033636");
        });

    });

    describe("for inetnum with usage status", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/inetnum/194.171.0.0%20-%20194.171.255.255/");
        });

        it("should display address usage", () => {
            expect(page.usageStatus.isPresent()).toEqual(true);
            expect(page.usageStatusStatistics.count()).toEqual(2);
            expect(page.usageStatusStatistics.get(0).getText()).toEqual("80%");
            expect(page.usageStatusStatistics.get(1).getText()).toEqual("20%");
        });

        it("should contain 2 flags, 0 tickets and 0 dates", () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(2);
        });
    });

    describe("for inet6num", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/inet6num/2001:7f8::%2F29/");
        });

        it("should show whois object attributes", () => {

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

            // filtering content in table text about number of items in table should change
            expect(page.numberOfMoreSpecific.getText()).toEqual("Total more specifics:");
            page.filterOfMoreSpecific.sendKeys("nooo");
            expect(page.numberOfMoreSpecific.getText()).toEqual("Showing out of");
            page.filterOfMoreSpecific.clear();

            expect(page.getTableCell(page.moreSpecificsTable, 0, 0).getText()).toEqual("2001:7f8::/48");
            expect(page.getTableCell(page.moreSpecificsTable, 0, 1).getText()).toEqual("ASSIGNED PI");
            expect(page.getTableCell(page.moreSpecificsTable, 0, 2).getText()).toEqual("DE-CIX-IXP-20010913");

            expect(page.getTableCell(page.moreSpecificsTable, 1, 0).getText()).toEqual("2001:7f8:1::/48");
            expect(page.getTableCell(page.moreSpecificsTable, 1, 1).getText()).toEqual("ASSIGNED PI");
            expect(page.getTableCell(page.moreSpecificsTable, 1, 2).getText()).toEqual("AMS-IX-20010913");
        });
    });


    describe("for aut-num with loads of attributes", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/aut-num/AS204056/");
        });

        it("should show a partial view that can be expanded", () => {

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
            expect(attributes.get(9).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(10).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(11).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(12).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(13).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(14).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(15).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(16).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(17).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(18).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(19).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(20).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(21).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(22).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(23).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(24).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);

            expect(whoisObject.isPresent()).toEqual(true);
            expect(whoisObject.showMoreButton().isPresent()).toEqual(true);

            expect(attributes.count()).toEqual(25);

            page.scrollIntoView(whoisObject.showMoreButton());
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
            expect(attributes.get(9).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(10).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(11).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            //Same... :/
            expect(attributes.get(53).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(54).getText()).toMatch(/remarks: *For information on "status:" attribute read https:\/\/www.ripe.net\/data-tools\/db\/faq\/faq-status-values-legacy-resources/);
            expect(attributes.get(55).getText()).toMatch(/status: *ASSIGNED/);
            expect(attributes.get(56).getText()).toMatch(/mnt-by: *RIPE-NCC-END-MNT/);
            expect(attributes.get(57).getText()).toMatch(/mnt-by: *RU1C-MNT/);
            expect(attributes.get(58).getText()).toMatch(/mnt-routes: *RU1C-MNT/);
            expect(attributes.get(59).getText()).toMatch(/created: *2016-03-22T13:43:48Z/);
            expect(attributes.get(60).getText()).toMatch(/last-modified: *2017-03-23T12:08:46Z/);
            expect(attributes.get(61).getText()).toMatch(/source: *RIPE/);

            expect(page.moreSpecificsTable.isPresent()).toEqual(false);
        });

        it("should contain 4 flags, 1 ticket and 1 date", () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(4);
            expect(page.flags.get(2).getText()).toEqual("2017-06-19");
            expect(page.flags.get(3).getText()).toEqual("NCC#201001020355");
        });
    });

    describe("for out of region aut-num", () => {

        beforeEach(() => {
            browser.get(browser.baseUrl + "#/myresources/detail/aut-num/AS36867/");
        });

        it("should show out of region aut-num", () => {
            let whoisObject = page.getWhoisObject();
            let attributes = whoisObject.attributes();
            expect(whoisObject.isPresent()).toEqual(true);
            expect(attributes.count()).toEqual(12);
            expect(attributes.get(0).getText()).toMatch(/aut-num: *AS36867/);
            expect(attributes.get(1).getText()).toMatch(/as-name: *Kokonet-BGP/);
            expect(attributes.get(2).getText()).toMatch(/descr: *Kokonet Ltd Seychelles ISP/);
            expect(attributes.get(3).getText()).toMatch(/org: *ORG-Sb3-RIPE/);
            expect(attributes.get(4).getText()).toMatch(/admin-c: *SNS1-RIPE/);
            expect(attributes.get(5).getText()).toMatch(/tech-c: *JK9622-RIPE/);
            expect(attributes.get(6).getText()).toMatch(/status: *OTHER/);
            expect(attributes.get(11).getText()).toMatch(/source: *RIPE-NONAUTH/);
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(0).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS36867&type=aut-num");
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(3).getAttribute("href")).toContain("?source=ripe-nonauth&key=ORG-Sb3-RIPE&type=organisation");
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(4).getAttribute("href")).toContain("?source=ripe-nonauth&key=SNS1-RIPE&type=role");
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(5).getAttribute("href")).toContain("?source=ripe-nonauth&key=JK9622-RIPE&type=person");
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(7).getAttribute("href")).toContain("?source=ripe-nonauth&key=KOKONET-MNT&type=mntner");
            expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(8).getAttribute("href")).toContain("?source=ripe-nonauth&key=RIPE-NCC-RPSL-MNT&type=mntner");
        });

        it("should edit and update out of region aut-num", () => {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys("KOKONET-MNT");
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.inpDescr.isPresent()).toBe(true);
            page.scrollIntoView(page.inpDescr);
            page.inpDescr.sendKeys("Updated test description");
            page.scrollIntoView(page.inpDescr);
            page.btnAddAnAttribute(page.inpDescr).click();
            page.scrollIntoView(page.modal);
            page.modalBtnSubmit.click();

            expect(page.inpDescr2.isPresent()).toBe(true);
            page.btnRemoveAttribute(page.inpDescr2).click();
            expect(page.inpDescr2.isPresent()).toBe(false);

            // source field should be disabled
            expect(page.woeSource.getAttribute("disabled")).toBeTruthy();

            page.scrollIntoView(page.btnSubmitObject);
            page.btnSubmitObject.click();
            expect(page.successMessage.isPresent()).toBe(true);
        });

        it("should contain 2 flags", () => {
            expect(page.flagsContainer.isPresent()).toEqual(true);
            expect(page.flags.count()).toEqual(2);
            expect(page.flags.get(0).getText()).toEqual("OTHER");
            expect(page.flags.get(1).getText()).toEqual("KOKONET-BGP");
        });
    });
});
