import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {ScreenLogicInterceptorService} from "../../../app/ng/updates/screen-logic-interceptor.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";
import {UpdatesModule} from "../../../app/ng/updates/update.module";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {LinkService} from "../../../app/ng/updates/link.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {IAttributeModel} from "../../../app/ng/shared/whois-response-type.model";

describe("ScreenLogicInterceptorService Organisation", () => {

    let interceptor: ScreenLogicInterceptorService;
    let whoisResourcesService: WhoisResourcesService;
    let whoisMetaService: WhoisMetaService;

    let MockMntnerService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(["RIPE-NCC-HM-MNT", "RIPE-NCC-END-MNT", "RIPE-NCC-LEGACY-MNT"], mntnerKey.toUpperCase())
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesModule],
            providers: [
                ScreenLogicInterceptorService,
                MessageStoreService,
                LinkService,
                WhoisMetaService,
                WhoisResourcesService,
                { provide: "OrganisationHelperService", useValue: { containsAbuseC: (attributes: any) => attributes, addAbuseC: (attributes: any) => attributes}},
                { provide: MntnerService, useValue: MockMntnerService},
                { provide: Router, useValue: {navigate:() => {}, events: of()}}
            ],
        });
        interceptor = TestBed.get(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.get(WhoisResourcesService);
        whoisMetaService = TestBed.get(WhoisMetaService);
    });

    it("should set default organisation before-edit organisation on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "organisation", before, errors, warnings, infos);

        const organisation = after.getAllAttributesOnName("organisation");
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual("organisation");
        expect(organisation[0].value).toEqual("AUTO-1");

    });

    it("should NOT set default organisation before-edit organisation on Modify operation", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("organisation", "SOME_ORG");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const organisation = after.getAllAttributesOnName("organisation");
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual("organisation");
        expect(organisation[0].value).toEqual("SOME_ORG");

    });

    it("should set default org-type before-edit organisation on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "organisation", before, errors, warnings, infos);

        const orgType = after.getAllAttributesOnName("org-type");
        expect(orgType.length).toEqual(1);
        expect(orgType[0].name).toEqual("org-type");
        expect(orgType[0].value).toEqual("OTHER");
        expect(orgType[0].$$meta.$$disable).toBe(true);

    });

    it("should NOT set default org-type before-edit organisation on Modify operation", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "SOME_ORG_TYPE");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const orgType = after.getAllAttributesOnName("org-type");
        expect(orgType.length).toEqual(1);
        expect(orgType[0].name).toEqual("org-type");
        expect(orgType[0].value).toEqual("SOME_ORG_TYPE");
        expect(orgType[0].$$meta.$$disable).toBe(true);

    });

    it("should add empty abuse-c by default organisation before-edit organisation on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "organisation", before, errors, warnings, infos);

        const abuseC = after.getAllAttributesOnName("abuse-c");
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual("abuse-c");
        expect(abuseC[0].value).toEqual("");

    });

    it("should add flag if abuse-c is not present for the organisation before-edit organisation on Modify operation", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const abuseC = after.getAllAttributesOnName("abuse-c");
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual("abuse-c");
        expect(abuseC[0].value).toEqual("");
        expect(abuseC[0].$$meta.$$missing).toBe(true);
        expect(warnings.length).toEqual(1);
        expect(warnings[0]).toContain("<p>There is currently no abuse contact set up for your organisation, which is required under");
        expect(warnings[0]).toContain(`<a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p>`);
        expect(warnings[0]).toContain("<p>Please specify the abuse-c attribute below.</p>");
    });

    it("should add warning if abuse-c is not present for the organisation before-edit organisation on Modify operation", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        expect(warnings.length).toEqual(1);
        expect(warnings[0]).toContain("<p>There is currently no abuse contact set up for your organisation, which is required under");
        expect(warnings[0]).toContain(`<a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p>`);
        expect(warnings[0]).toContain("<p>Please specify the abuse-c attribute below.</p>");

    });

    it("should NOT add empty abuse-c if it exists for default organisation before-edit organisation on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));
        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after0 = interceptor.beforeEdit("Create", "RIPE", "organisation", before, errors, warnings, infos);
        after0.setSingleAttributeOnName("abuse-c", "bogus abuse-c string");
        const after1 = interceptor.beforeEdit("Create", "RIPE", "organisation", after0, errors, warnings, infos);

        const abuseC = after1.getAllAttributesOnName("abuse-c");
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual("abuse-c");
        expect(abuseC[0].value).toEqual("bogus abuse-c string");

    });

    it("should flag as LIR attribute all mnt-by before-edit organisation on Modify operation for LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const mntByList = after.getAllAttributesOnName("mnt-by");
        expect(mntByList.length).toEqual(2);
        expect(mntByList[0].$$meta.$$isLir).toBe(true);
        expect(mntByList[1].$$meta.$$isLir).toBe(true);

    });

    it("should NOT flag as LIR attribute any mnt-by before-edit organisation on Modify operation for non-LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "OTHER");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const mntByList = after.getAllAttributesOnName("mnt-by");
        expect(mntByList.length).toEqual(2);
        expect(mntByList[0].$$meta.$$isLir).toBeUndefined();
        expect(mntByList[1].$$meta.$$isLir).toBeUndefined();

    });

    it("should flag address, phone, fax-no, e-mail and org-name as LIR attribute on Modify operation for LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const address = after.getAllAttributesOnName("address");
        expect(address.length).toEqual(1);
        expect(address[0].$$meta.$$isLir).toBe(true);

        const phone = after.getAllAttributesOnName("phone");
        expect(phone.length).toEqual(1);
        expect(phone[0].$$meta.$$isLir).toBe(true);

        const faxNumber = after.getAllAttributesOnName("fax-no");
        expect(faxNumber.length).toEqual(1);
        expect(faxNumber[0].$$meta.$$isLir).toBe(true);

        const email = after.getAllAttributesOnName("e-mail");
        expect(email.length).toEqual(1);
        expect(email[0].$$meta.$$isLir).toBe(true);

        const orgName = after.getAllAttributesOnName("org-name");
        expect(orgName.length).toEqual(1);
        expect(orgName[0].$$meta.$$isLir).toBe(true);
    });

    it("should NOT flag address, phone, fax-no, e-mail and org-name as LIR attribute on Modify operation for non-LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "OTHER");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const address = after.getAllAttributesOnName("address");
        expect(address.length).toEqual(1);
        expect(address[0].$$meta.$$isLir).toBeUndefined();

        const phone = after.getAllAttributesOnName("phone");
        expect(phone.length).toEqual(1);
        expect(phone[0].$$meta.$$isLir).toBeUndefined();

        const faxNumber = after.getAllAttributesOnName("fax-no");
        expect(faxNumber.length).toEqual(1);
        expect(faxNumber[0].$$meta.$$isLir).toBeUndefined();

        const email = after.getAllAttributesOnName("e-mail");
        expect(email.length).toEqual(1);
        expect(email[0].$$meta.$$isLir).toBeUndefined();

        const orgName = after.getAllAttributesOnName("org-name");
        expect(orgName.length).toEqual(1);
        expect(orgName[0].$$meta.$$isLir).toBeUndefined();
    });

    it("should disable org on Modify operation for LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const orgAttr = after.getAllAttributesOnName("org");
        expect(orgAttr.length).toEqual(1);
        expect(orgAttr[0].$$meta.$$disable).toBe(true);
    });

    it("should NOT disable org on Modify operation for non-LIRs", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "OTHER");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const orgAttr = after.getAllAttributesOnName("org");
        expect(orgAttr.length).toEqual(1);
        expect(orgAttr[0].$$meta.$$disable).toBeUndefined();

    });

    it("should NOT disable mnt-by before-edit organisation on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "organisation", before, errors, warnings, infos);

        const mntByList = after.getAllAttributesOnName("mnt-by");
        expect(mntByList[0].$$meta.$$disable).toBeUndefined();
    });

    it("should remove abuse-mailbox from organisation addable attributes when it is an LIR on Modify", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");
        const addableAttributes = _wrap("organisation", organisationSubject.getAddableAttributes("organisation", organisationSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "organisation", organisationSubject, addableAttributes);

        const abuseMailbox = filteredAddableAttributes.getSingleAttributeOnName("abuse-mailbox");
        expect(abuseMailbox).toBeUndefined();
    });

    it("should remove org from organisation addable attributes when it is an LIR on Modify", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");
        const addableAttributes = _wrap("organisation", organisationSubject.getAddableAttributes("organisation", organisationSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "organisation", organisationSubject, addableAttributes);

        const orgAttr = filteredAddableAttributes.getSingleAttributeOnName("org");
        expect(orgAttr).toBeUndefined();
    });

    it("should NOT remove org from organisation addable attributes when it is an NON-LIR on Modify", () => {
        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("org-type", "OTHER");
        const addableAttributes = _wrap("organisation", organisationSubject.getAddableAttributes("organisation", organisationSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "organisation", organisationSubject, addableAttributes);

        const orgAttr = filteredAddableAttributes.getSingleAttributeOnName("org");
        expect(orgAttr).not.toBeUndefined();
    });

    it("should NOT remove org from organisation addable attributes when it action is not Modify", () => {
        const organisationSubject = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));
        organisationSubject.setSingleAttributeOnName("org-type", "LIR");
        const addableAttributes = _wrap("organisation", organisationSubject.getAddableAttributes("organisation", organisationSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Create", "RIPE", "organisation", organisationSubject, addableAttributes);

        const orgAttr = filteredAddableAttributes.getSingleAttributeOnName("org");
        expect(orgAttr).not.toBeUndefined();
    });

    it("should disable mnt-ref with ripe maintainers on modify", () => {

        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("mnt-ref", "RIPE-NCC-HM-MNT");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const attributes = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const mntRef = attributes.getSingleAttributeOnName("mnt-ref");
        expect(mntRef.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-ref with non-ripe maintainers on modify", () => {

        const organisationSubject = _wrap("organisation", organisationAttributes);
        organisationSubject.setSingleAttributeOnName("mnt-ref", "NON-RIPE-MNT");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const attributes = interceptor.beforeEdit("Modify", "RIPE", "organisation", organisationSubject, errors, warnings, infos);

        const mntRef = attributes.getSingleAttributeOnName("mnt-ref");
        expect(mntRef.$$meta.$$disable).toBeFalsy();
    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const organisationAttributes =  [ {
         name : "organisation",
         value :"ORG-WA56-RIPE"
    }, {
         name :"org-name",
         value :"Swi Rop Gonggrijp"
    }, {
         name :"org-type",
         value :"OTHER"
    }, {
         name :"org",
         value :"ORG-RIEN1-RIPE"
    }, {
         name :"address",
         value :"The Netherlands"
    }, {
        name :"e-mail",
        value :"bla@blu.net"
    }, {
        name :"phone",
        value :"222222"
    }, {
        name :"fax-no",
        value :"333333"
    }, {
         name :"admin-c",
         value :"WH869-RIPE"
    }, {
         name :"tech-c",
         value :"WH869-RIPE"
    }, {
         name :"mnt-ref",
         value :"WHAT-A-MESH-MNT"
    }, {
         name :"mnt-by",
         value :"WHAT-A-MESH-MNT"
    }, {
        name :"mnt-by",
        value :"WHAT-A-MESH2-MNT"
    }, {
        name :"abuse-mailbox",
        value :"bla@ble.com"
    }, {
         name :"source",
         value :"RIPE"
    } ];

});
