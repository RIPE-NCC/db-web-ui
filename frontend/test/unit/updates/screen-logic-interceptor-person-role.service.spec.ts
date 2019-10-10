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

describe("ScreenLogicInterceptorService Person/Role", () => {

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

    it("should set default nic-ndl before-edit person on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("person"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "person", before, errors, warnings, infos);

        const nicHdle = after.getAllAttributesOnName("nic-hdl");
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual("nic-hdl");
        expect(nicHdle[0].value).toEqual("AUTO-1");
    });

    it("should NOT set default nic-ndl before-edit person on Modify operation", () => {
        let personSubject = _wrap("person", personAttributes);
        personSubject.setSingleAttributeOnName("nic-hdl", "SOME_NIC");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "person", personSubject, errors, warnings, infos);

        const nicHdle = after.getAllAttributesOnName("nic-hdl");
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual("nic-hdl");
        expect(nicHdle[0].value).toEqual("SOME_NIC");

    });

    it("should set default nic-ndl before-edit role on Create operation", () => {
        const before = whoisResourcesService.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType("role"));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Create", "RIPE", "role", before, errors, warnings, infos);

        const nicHdle = after.getAllAttributesOnName("nic-hdl");
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual("nic-hdl");
        expect(nicHdle[0].value).toEqual("AUTO-1");

    });

    it("should NOT set default nic-ndl before-edit role on Modify operation", () => {
        const roleSubject = _wrap("person", roleAttributes);
        roleSubject.setSingleAttributeOnName("nic-hdl", "SOME_NIC");

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit("Modify", "RIPE", "person", roleSubject, errors, warnings, infos);

        const nicHdle = after.getAllAttributesOnName("nic-hdl");
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual("nic-hdl");
        expect(nicHdle[0].value).toEqual("SOME_NIC");

    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const personAttributes = [{
            name :"person",
            value :"Name Removed"
        }, {
            name :"address",
            value :"The Netherlands"
        }, {
            name :"phone",
            value :"+31 20 ... ...."
        }, {
            name :"e-mail",
            value :"****@ripe.net"
        }, {
            name :"mnt-by",
            value :"aardvark-mnt"
        }, {
            name :"nic-hdl",
            value :"DW-RIPE"
        }, {
            name :"source",
            value :"RIPE"
        } ];

    const roleAttributes = [{
            name :"role",
            value :"Name Removed"
        }, {
            name :"address",
            value :"The Netherlands"
        }, {
            name :"phone",
            value :"+31 20 ... ...."
        }, {
            name :"e-mail",
            value :"****@ripe.net"
        }, {
            name :"mnt-by",
            value :"aardvark-mnt"
        }, {
            name :"nic-hdl",
            value :"DW-RIPE"
        }, {
            name :"source",
            value :"RIPE"
        } ];

});
