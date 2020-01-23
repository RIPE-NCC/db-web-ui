import {browser} from "protractor";

const page = require("./homePageObject");

describe("The lookup page", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "lookup?source=RIPE&type=inetnum&key=193.0.0.0%20-%20193.0.0.63");
    });

    it("should be able to show an object", () => {
        expect(page.lookupPageViewer.isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.count()).toEqual(25);
        expect(page.lookupHeader.isPresent()).toEqual(true);
        expect(page.lookupHeader.getText()).toContain("Responsible organisation: Internet Assigned Numbers Authority");
        expect(page.ripeManagedAttributesLabel.getText()).toContain("Highlight RIPE NCC managed values");

        page.scrollIntoView(page.byId("showEntireObjectInViewer"));
        page.byId("showEntireObjectInViewer").click();
        expect(page.lookupPageObjectLi.count()).toEqual(36);

    });

    it("should show the remarks field starting with hash (#)", () => {
        expect(page.lookupPageObjectLi.get(5).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(4).getText()).toContain("# comments starting with hash");
    });

    it("should show comment behind value starting with hash (#)", () => {
        expect(page.lookupPageObjectLi.get(2).isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.get(2).getText()).toContain("IPv4 address block not managed by the RIPE ibihvjg # test shown comment");
    });

    it("should show not filtered object", () => {
        page.scrollIntoView(page.byId("showEntireObjectInViewer"));
        page.byId("showEntireObjectInViewer").click();
        expect(page.getAttributeFromWhoisObjectOnLookupPage(25).getText()).toContain("notify");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(25).getText()).toContain("***@ripe.net");
    });

    it("should show version of whois after searching", () => {
        page.scrollIntoView(page.whoisVersion);
        expect(page.whoisVersion.getText()).toEqual("RIPE Database Software Version 1.97-SNAPSHOT");
    });
});

describe("The lookup page for organisation", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "lookup?source=RIPE&type=organisation&key=ORG-RIEN1-RIPE");
    });

    it("should show not filtered object", () => {
        expect(page.lookupPageViewer.isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.count()).toEqual(22);
        expect(page.lookupHeader.isPresent()).toEqual(false);
        expect(page.getAttributeFromWhoisObjectOnLookupPage(10).getText()).toContain("e-mail");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(10).getText()).toContain("***@ripe.net");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(15).getText()).toContain("notify");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(15).getText()).toContain("***@ripe.net");
    });

    it("should show version of whois after searching", () => {
        page.scrollIntoView(page.whoisVersion);
        expect(page.whoisVersion.getText()).toEqual("RIPE Database Software Version 1.97-SNAPSHOT");
    });
});

describe("The lookup page with out of region object from ripe db", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "lookup?source=ripe&key=211.43.192.0%2F19AS9777&type=route");
    });

    it("should be able to show an out of region object from ripe db", () => {
        expect(page.lookupPageViewer.isPresent()).toEqual(true);
        expect(page.lookupPageObjectLi.count()).toEqual(9);
        expect(page.lookupHeader.isPresent()).toEqual(false);
        expect(page.btnRipeStat.getAttribute("href")).toEqual("https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb");
        // XML
        expect(page.lookupLinkToXmlJSON.get(0).getAttribute("href")).toContain("/ripe/route/211.43.192.0/19AS9777.xml");
        // JSON
        expect(page.lookupLinkToXmlJSON.get(1).getAttribute("href")).toContain("/ripe/route/211.43.192.0/19AS9777.json");
        // mnt
        expect(page.getAttributeHrefFromWhoisObjectOnLookupPage(3).getAttribute("href")).toContain("?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(6).getText()).toContain("# comment");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(7).getText()).toContain("notify");
        expect(page.getAttributeFromWhoisObjectOnLookupPage(7).getText()).toContain("***@npix.net");
    });

    it("should show version of whois after searching", () => {
        page.scrollIntoView(page.whoisVersion);
        expect(page.whoisVersion.getText()).toEqual("RIPE Database Software Version 1.97-SNAPSHOT");
    });
});
