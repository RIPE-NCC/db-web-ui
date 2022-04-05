import {browser, by} from "protractor";

const page = require("./homePageObject");

describe("Resources", () => {

    beforeEach(() => {
        page.navigateTo(browser.baseUrl + "myresources/overview");
    });

    it("should show IPv4 resources for an LIR", () => {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.myResourcesActiveTabLabel.getText()).toContain("IPv4");
        expect(page.myResourcesActiveTabRows.count()).toBe(4);
        expect(page.myResourcesActiveTabRows.get(0).getText()).toContain("194.104.0.0/24");
        // contain href in a tag what guarantees option "Open in new tab" in context menu
        expect(page.myResourcesActiveTabRows.get(0).element(by.css("a")).getAttribute("href")).toContain("myresources/detail/INETNUM/194.104.0.0%20-%20194.104.0.255/false");
        expect(page.myResourcesActiveTabRows.get(1).getText()).toContain("194.171.0.0/16");
        expect(page.myResourcesActiveTabRows.get(1).element(by.css("a")).getAttribute("href")).toContain("myresources/detail/INETNUM/194.171.0.0%20-%20194.171.255.255/false");
        expect(page.myResourcesActiveTabRows.get(2).getText()).toContain("195.169.0.0/16");
        expect(page.myResourcesActiveTabRows.get(2).element(by.css("a")).getAttribute("href")).toContain("myresources/detail/INETNUM/195.169.0.0%20-%20195.169.255.255/false");
        expect(page.myResourcesActiveTabRows.get(3).getText()).toContain("192.87.0.0/16");
        expect(page.myResourcesActiveTabRows.get(3).element(by.css("a")).getAttribute("href")).toContain("myresources/detail/INETNUM/192.87.0.0%20-%20192.87.255.255/false");
    });

    it("should show progressbar for IPv4 resources with status ALLOCATED PA", () => {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.progressbarFromResourceItem(1).isPresent()).toEqual(true);
    });

    it("should hide progressbar for IPv4 resources with status ASSIGNED PI", () => {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.progressbarFromResourceItem(0).isPresent()).toEqual(false);
    });

    it("should show sponsored IPv4 resources", () => {
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain("My Resources");
        // switch to Sponsored Resources
        page.tabSponsoredResources.click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain("Sponsored Resources");
        expect(page.myResourcesActiveTabRows.count()).toBe(42);
        // switch back to My Resources
        page.tabMyResources.click();
    });

    it("should not show Sponsored Resources tab after switching to an enduser", () => {
        page.tabSponsoredResources.click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain("Sponsored Resources");
        page.orgSelector.click();
        // switch selected org to Viollier AG
        page.orgSelectorOptions.get(3).click();
        expect(page.tabsMySponsoredResourcesActiveLabel.getText()).toContain("My Resources");
        expect(page.tabSponsoredResources.isPresent()).toBeFalsy();
        page.orgSelector.click();
        // switch back selected org to SURFnet
        page.orgSelectorOptions.get(0).click();
    });

    it("should show menu item Request resources in ... button for selected LIR organisation", () => {
        expect(page.btnTransfer.isPresent()).toEqual(true);
        page.btnTransfer.click();
        expect(page.transferMenuItems.get(0).getText()).toContain("Transfer resources");
        expect(page.transferMenuItems.get(1).getText()).toContain("Request resources");
        page.tabSponsoredResources.click();
        expect(page.btnTransfer.isPresent()).toEqual(true);
        page.btnTransfer.click();
        expect(page.transferMenuItems.get(0).getText()).toContain("Start/stop sponsoring PI resources");
        expect(page.transferMenuItems.get(1).getText()).toContain("Transfer customer\'s resources");
    });

    it("should hide ... button for selected not LIR organisation", () => {
        page.orgSelector.click();
        //selected Swi Rop Gonggrijp - ORG
        page.orgSelectorOptions.get(2).click();
        expect(page.btnTransfer.isPresent()).toEqual(false);
        //selected SURFnet bv - LIR
        page.orgSelector.click();
        page.orgSelectorOptions.get(0).click();
        expect(page.btnTransfer.isPresent()).toEqual(true);
        expect(page.transferMenuItems.count()).toEqual(2);
    });

    it("should show Create assignment button on My Resources tab", () => {
        expect(page.btnCreateAssignment.isPresent()).toEqual(true);
    });

    it("should navigate to create inetnum page on click button Create assignment", () => {
        expect(page.btnCreateAssignment.isPresent()).toEqual(true);
        page.btnCreateAssignment.click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "webupdates/create/RIPE/inetnum");
    });

    it("should navigate to create inet6num page on click button Create assignment", () => {
        page.myResourcesTabs.get(1).click();
        expect(page.btnCreateAssignment.isPresent()).toEqual(true);
        page.btnCreateAssignment.click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "webupdates/create/RIPE/inet6num");
    });

    it("should not show Create assignment button on ASN tab", () => {
        page.myResourcesTabs.get(2).click();
        expect(page.btnCreateAssignment.isPresent()).toEqual(false);
    });

    it("should not show Create assignment button on Sponsored Resources tab", async () => {
        await page.scrollIntoCenteredView(page.tabsMySponsoredResources);
        page.tabSponsoredResources.click();
        expect(page.btnCreateAssignment.isPresent()).toEqual(false);
    });

    it("should show sponsored flag", () => {
        expect(page.myResourcesActiveTabRows.get(3).all(by.css("flag")).get(2).getText()).toEqual("Sponsored resource");
    });

    it("should show IRR and RDNS flags", () => {
        expect(page.myResourcesActiveTabRows.get(0).all(by.css("flag")).get(2).getText()).toEqual("IRR");
        // browser.actions().mouseMove(page.myResourcesActiveTabRows.get(0).all(by.css("flag")).get(2)).perform();
        expect(page.myResourcesActiveTabRows.get(0).all(by.css("flag")).get(3).getText()).toEqual("rDNS");
        expect(page.myResourcesActiveTabRows.get(1).all(by.css("flag")).get(2).getText()).toEqual("rDNS");
        expect(page.myResourcesActiveTabRows.get(2).all(by.css("flag")).get(2).getText()).toEqual("IRR");
    });

    it("should show out of region (RIPE-NONAUTH) autnum", () => {
        expect(page.myResources.isPresent()).toEqual(true);
        expect(page.myResourcesTabs.count()).toEqual(3);
        page.myResourcesTabs.get(2).click();
        expect(page.myResourcesActiveTabLabel.getText()).toContain("ASN");
        expect(page.myResourcesActiveTabRows.count()).toBe(76);
        // RIPE-NONAUTH item - aut-num which is out of region
        expect(page.myResourcesActiveTabRows.get(75).isPresent()).toBeTruthy();
    });

    it("should show ip usage for all IPv4 resources", () => {
        expect(page.resourcesIpUsage.isPresent()).toBeTruthy();
        expect(page.resourcesIpUsage.count()).toEqual(3);
        expect(page.resourcesIpUsage.get(0).getText()).toEqual("Total allocated: 3072");
        expect(page.resourcesIpUsage.get(1).getText()).toEqual("Total allocated used: 2048");
        expect(page.resourcesIpUsage.get(2).getText()).toEqual("Total allocated free: 1024");
    });

    it("should show ip usage for all IPv6 resources", () => {
        page.myResourcesTabs.get(1).click();
        expect(page.resourcesIpUsage.isPresent()).toBeTruthy();
        expect(page.resourcesIpUsage.count()).toEqual(3);
        expect(page.resourcesIpUsage.get(0).getText()).toEqual("Total allocated subnets: 64K");
        expect(page.resourcesIpUsage.get(1).getText()).toEqual("Total allocated subnets used: 0");
        expect(page.resourcesIpUsage.get(2).getText()).toEqual("Total allocated subnets free: 64K");
    });

    it("should show ip usage for asn", () => {
        page.myResourcesTabs.get(2).click();
        expect(page.resourcesIpUsage.isPresent()).toBeFalsy();
    });

    it("should not show ip usage for sponsored tabs", () => {
        page.tabSponsoredResources.click();
        page.myResourcesTabs.get(0).click();
        expect(page.resourcesIpUsage.isPresent()).toBeFalsy();
    });

});
