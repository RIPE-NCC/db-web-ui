import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {ScreenLogicInterceptorService} from "../../../app/ng/updates/screen-logic-interceptor.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";
import {UpdatesModule} from "../../../app/ng/updates/update.module";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {LinkService} from "../../../app/ng/updates/link.service";
import {IAttributeModel} from "../../../app/ng/shared/whois-response-type.model";

describe("ScreenLogicInterceptorService Inet6Num", () => {

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
    
    it("should disable org attribute from inet6num when status is ASSIGNED PI", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inet6NumSubject);

        const orgAttr = attributes.getSingleAttributeOnName("org");
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it("should disable netname attribute from inet6num when status is ALLOCATED PA, ALLOCATED UNSPECIFIED or ALLOCATED-BY-RIR", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "ALLOCATED PA");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inet6NumSubject);

        const netnameAttr = attributes.getSingleAttributeOnName("netname");
        expect(netnameAttr.$$meta.$$disable).toBe(true);
    });

    it("should not remove sponsoring org from inet6num addable attributes when status is LEGACY", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "LEGACY");

        const addableAttributes = _wrap("inet6num", inet6NumSubject.getAddableAttributes("inet6num", inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inet6num", inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-PI", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "ASSIGNED PI");

        const addableAttributes = _wrap("inet6num", inet6NumSubject.getAddableAttributes("inet6num", inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inet6num", inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-ANYCAST", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "ASSIGNED ANYCAST");

        const addableAttributes = _wrap("inet6num", inet6NumSubject.getAddableAttributes("inet6num", inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inet6num", inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should remove sponsoring org from inet6num addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "ASSIGNED");

        let addableAttributes = _wrap("inet6num", inet6NumSubject.getAddableAttributes("inet6num", inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inet6num", inet6NumSubject, addableAttributes);

        let sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it("should not remove sponsoring org from inet6num addable attributes when status is empty", () =>  {

        let inet6NumSubject = _wrap("inet6num", inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName("status", "");

        const addableAttributes = _wrap("inet6num", inet6NumSubject.getAddableAttributes("inet6num", inet6NumSubject));

        let filteredAddableAttributes = interceptor.beforeAddAttribute("Modify", "RIPE", "inet6num", inet6NumSubject, addableAttributes);

        let sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName("sponsoring-org");
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it("should disable mnt-domains with ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject .setSingleAttributeOnName("mnt-domains", "RIPE-NCC-HM-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntDomains = attributes.getSingleAttributeOnName("mnt-domains");
        expect(mntDomains.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-domains with non-ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-domains", "NON-RIPE-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntDomains = attributes.getSingleAttributeOnName("mnt-domains");
        expect(mntDomains.$$meta.$$disable).toBeFalsy();
    });

    it("should disable mnt-lower with ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-lower", "RIPE-NCC-HM-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntLower = attributes.getSingleAttributeOnName("mnt-lower");
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-lower with non-ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-lower", "NON-RIPE-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntLower = attributes.getSingleAttributeOnName("mnt-lower");
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    it("should disable mnt-routes with ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-routes", "RIPE-NCC-HM-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntLower = attributes.getSingleAttributeOnName("mnt-routes");
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it("should NOT disable mnt-routes with non-ripe maintainers on modify", () =>  {

        let inetNumSubject = _wrap("inet6num", inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName("mnt-routes", "NON-RIPE-MNT");

        const attributes = interceptor.beforeEdit("Modify", "RIPE", "inet6num", inetNumSubject);

        let mntLower = attributes.getSingleAttributeOnName("mnt-routes");
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const inet6NumAttributes =  [{
        name :"inet6num",
        value :"2001:7f8:7::/48"
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
