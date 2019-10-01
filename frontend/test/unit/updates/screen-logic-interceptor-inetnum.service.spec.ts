import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {IAttributeModel} from "../../../app/ng/shared/whois-response-type.model";
import {ScreenLogicInterceptorService} from "../../../app/ng/updates/screen-logic-interceptor.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";
import {UpdatesModule} from "../../../app/ng/updates/update.module";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {LinkService} from "../../../app/ng/updates/link.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";

describe("ScreenLogicInterceptorService InetNum", () => {

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

    it("should disable org attribute from inetnum when status is ASSIGNED PI", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var orgAttr = attributes.getSingleAttributeOnName("org");
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it("should not remove sponsoring org from inetnum addable attributes when status is LEGACY", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "LEGACY");

        var addableAttributes = _wrap("inetnum", inetNumSubject.getAddableAttributes("inetnum", inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inetnum", inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-PI", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        var addableAttributes = _wrap("inetnum", inetNumSubject.getAddableAttributes("inetnum", inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inetnum", inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-ANYCAST", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "ASSIGNED ANYCAST");

        var addableAttributes = _wrap("inetnum", inetNumSubject.getAddableAttributes("inetnum", inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inetnum", inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should remove sponsoring org from inetnum addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "ASSIGNED");

        var addableAttributes = _wrap("inetnum", inetNumSubject.getAddableAttributes("inetnum", inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inetnum", inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it("should not remove sponsoring org from inetnum addable attributes when status is empty", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("status", "");

        var addableAttributes = _wrap("inetnum", inetNumSubject.getAddableAttributes("inetnum", inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inetnum", inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should disable mnt-domains with ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject .setSingleAttributeOnName("mnt-domains", "RIPE-NCC-HM-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntDomains = attributes.getSingleAttributeOnName("mnt-domains");
        expect(mntDomains.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-domains with non-ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-domains", "NON-RIPE-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntDomains = attributes.getSingleAttributeOnName("mnt-domains");
        expect(mntDomains.$$meta.$$disable).toBeFalsy();
    });

    it("should disable mnt-lower with ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-lower", "RIPE-NCC-HM-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName("mnt-lower");
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-lower with non-ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-lower", "NON-RIPE-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName("mnt-lower");
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    it("should disable mnt-routes with ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-routes", "RIPE-NCC-HM-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName("mnt-routes");
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-routes with non-ripe maintainers on modify", function() {

        var inetNumSubject = _wrap("inetnum", inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-routes", "NON-RIPE-MNT");

        var attributes = interceptor.beforeEdit("Modify", "RIPE", "inetnum", inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName("mnt-routes");
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });


    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const inetNumAttributes =  [{
        name :"inetnum",
        value :"192.0.0.0 - 192.0.0.255"
    }, {
        name :"netname",
        value :"FICIX-V6-20020201"
    }, {
        name :"descr",
        value :"Finnish Communication and Internet Exchange - FICIX ryy"
    }, {
        name :"country",
        value :"FI"
    }, {
        name :"org",
        value :"ORG-Fr4-RIPE"
    }, {
        name :"admin-c",
        value :"JM289-RIPE"
    }, {
        name :"tech-c",
        value :"JM289-RIPE"
    }, {
        name :"mnt-by",
        value :"RIPE-NCC-END-MNT"
    }, {
        name :"mnt-by",
        value :"jome-mnt"
    }, {
        name :"mnt-domains",
        value :"jome-mnt"
    }, {
        name :"mnt-lower",
        value :"jome-mnt"
    }, {
        name :"mnt-routes",
        value :"jome-mnt"
    }, {
        name :"notify",
        value :"***@ficix.fi"
    }, {
        name :"status",
        value :"ASSIGNED PI"
    }, {
        name :"created",
        value :"2002-08-06T05:54:20Z"
    }, {
        name :"last-modified",
        value :"2016-03-06T10:58:07Z"
    }, {
        name :"source",
        value :"RIPE"
    } ];
});
