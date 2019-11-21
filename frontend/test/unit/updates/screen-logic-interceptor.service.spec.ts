import {TestBed} from "@angular/core/testing";
import {UpdatesModule} from "../../../src/app/updates/update.module";
import {ScreenLogicInterceptorService} from "../../../src/app/updates/screen-logic-interceptor.service";
import {LinkService} from "../../../src/app/updates/link.service";
import {MessageStoreService} from "../../../src/app/updates/message-store.service";
import {CredentialsService} from "../../../src/app/shared/credentials.service";
import {MntnerService} from "../../../src/app/updates/mntner.service";
import {WhoisResourcesService} from "../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";
import {Router} from "@angular/router";
import {of} from "rxjs";

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
                {provide: Router, useValue: {navigate:() => {}, events: of()}}
            ],
        });
        interceptor = TestBed.get(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.get(WhoisResourcesService);
        whoisMetaService = TestBed.get(WhoisMetaService);
    });

    it("should disable org attribute from aut-num when status is ASSIGNED PI", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(autNumSubject, "status", "ASSIGNED PI");

        let attributes = interceptor.beforeEdit("Modify", "RIPE", "aut-num", autNumSubject);

        let orgAttr = whoisResourcesService.getSingleAttributeOnName(attributes, "org");
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it("should set default source before-edit any object on Create operation", () => {
        let before = whoisResourcesService.validateAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("organisation"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        let after = interceptor.beforeEdit("Create", "TEST", "organisation", before, errors, warnings, infos);

        let organisation = whoisResourcesService.getAllAttributesOnName(after, "source");
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual("source");
        expect(organisation[0].value).toEqual("TEST");
        expect(organisation[0].$$meta.$$disable).toBe(true);

    });

    it("should not change addable attributes by default", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(autNumSubject, "status", "ASSIGNED PI");

        let addableAttributes = {attr:"some data"};
        let addableAttributesAfter = interceptor.beforeAddAttribute("Modify", "RIPE", "aut-num", autNumSubject, addableAttributes);

        expect(addableAttributesAfter).toBe(addableAttributes);
    });

    it("should disable primary key attribute from object on modify", () => {

        let autNumSubject = _wrap("aut-num", autNumAttributes);

        let attributes = interceptor.beforeEdit("Modify", "RIPE", "aut-num", autNumSubject);

        let primaryKey = whoisResourcesService.getSingleAttributeOnName(attributes, "aut-num");
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
