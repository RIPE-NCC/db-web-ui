import {browser, by, element} from "protractor";

const page = require("./homePageObject");

describe("webupdates homepage", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl);
        // Noisy logs enabled here...
        // browser.manage().logs().get("browser").then(function(browserLog) {
        //    console.log(">>>>>> " + require("util").inspect(browserLog));
        // });
    });

    it("should show an editor for as-set", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("as-set").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "as-set" object`);
    });

    // no Create "aut-num" object (only RS can create them)

    it("should show an editor for filter-set", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("filter-set").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "filter-set" object`);
    });

    it("should show an editor for inet-rtr", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("inet-rtr").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "inet-rtr" object`);
    });

    it("should show an editor for irt", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("irt").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "irt" object`);
    });

    it("should show an editor for key-cert", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("key-cert").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "key-cert" object`);
    });

    it("should show an editor for mntner", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("mntner").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "mntner" object`);
    });

    it("should show an editor for organisation", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("organisation").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "organisation" object`);
    });

    it("should show an editor for peering-set", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("peering-set").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "peering-set" object`);
    });

    it("should show an editor for person", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("person").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "person" object`);
    });

    it("should show an editor for role", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("role").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "role" object`);
    });

    it("should show an editor for route", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("route").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "route" object`);
    });

    it("should show an editor for route6", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("route6").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "route6" object`);
    });

    it("should show an editor for route-set", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("route-set").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "route-set" object`);
    });

    it("should show an editor for rtr-set", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("rtr-set").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create "rtr-set" object`);
    });

    it("should navigate to create role maintainer pair screen when selected", () => {
        expect(page.selectForm.isPresent()).toEqual(true);
        page.selectObjectType("role and maintainer pair").click();
        page.btnNavigateToCreate.click();
        expect(page.createForm.isPresent()).toEqual(true);
        expect(page.heading.getText()).toEqual(`Create role and maintainer pair`);
    })
});
