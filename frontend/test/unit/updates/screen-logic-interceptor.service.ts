import {TestBed} from "@angular/core/testing";
import {UpdatesModule} from "../../../app/ng/updates/update.module";
import {ScreenLogicInterceptorService} from "../../../app/ng/updates/screen-logic-interceptor.service";
import {LinkService} from "../../../app/ng/updates/link.service";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {CredentialsService} from "../../../app/ng/shared/credentials.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";

describe("ScreenLogicInterceptorService", () => {

    let interceptor: ScreenLogicInterceptorService;
    let whoisResourcesService: WhoisResourcesService;
    let whoisMetaService: WhoisMetaService;

    const credentialServiceMock = {
        getCredentials: () => {
            return {mntner: "B-MNT", successfulPassword: "secret"};
        },
        hasCredentials: () => {
            return true;
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesModule],
            providers: [
                ScreenLogicInterceptorService,
                {provide: "$log",  useValue: {info: () => {}, error: () => {} }},
                {provide: "OrganisationHelperService", useValue: {containsAbuseC: (attributes: any) => attributes, addAbuseC: (attributes: any) => attributes}},
                {provide: CredentialsService, useValue: credentialServiceMock},
                MessageStoreService,
                {provide: MntnerService, useValue: {isNccMntner: (mntnerKey: string) => true}},
                LinkService,
                WhoisMetaService,
                WhoisResourcesService,
            ],
        });
        interceptor = TestBed.get(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.get(WhoisResourcesService);
        whoisMetaService = TestBed.get(WhoisMetaService);
    });

    it("should disable org attribute from aut-num when status is ASSIGNED PI", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);
        autNumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        let attributes = interceptor.beforeEdit("Modify", "RIPE", "aut-num", autNumSubject);

        let orgAttr = attributes.getSingleAttributeOnName("org");
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it("should set default source before-edit any object on Create operation", () => {
        let before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        let after = interceptor.beforeEdit("Create", "TEST", "organisation", before, errors, warnings, infos);

        let organisation = after.getAllAttributesOnName("source");
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual("source");
        expect(organisation[0].value).toEqual("TEST");
        expect(organisation[0].$$meta.$$disable).toBe(true);

    });

    it("should not change addable attributes by default", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);
        autNumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        let addableAttributes = {attr:"some data"};
        let addableAttributesAfter = interceptor.beforeAddAttribute("Modify", "RIPE", "aut-num", autNumSubject, addableAttributes);

        expect(addableAttributesAfter).toBe(addableAttributes);
    });

    it("should disable primary key attribute from object on modify", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);

        let attributes = interceptor.beforeEdit("Modify", "RIPE", "aut-num", autNumSubject);

        let primaryKey = attributes.getSingleAttributeOnName("aut-num");
        expect(primaryKey.$$meta.$$disable).toBe(true);
    });

    const _wrap = (type: any, attrs: any) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    let autNumAttributes =  [{
        name :"aut-num",
        value :"AS123"
    }, {
        name :"as-name",
        value :"EXAMPLE"
    }, {
        name :"status",
        value :"ASSIGNED PI"
    }, {
        name :"org",
        value :"ORG-Fr4-RIPE"
    }, {
        name :"mnt-by",
        value :"RIPE-NCC-END-MNT"
    }, {
        name :"source",
        value :"RIPE"
    } ];

});
