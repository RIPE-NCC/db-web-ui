import {TestBed} from "@angular/core/testing";
import {of} from "rxjs";
import {Router} from "@angular/router";
import {CredentialsService} from "../../../src/app/shared/credentials.service";
import {MntnerService} from "../../../src/app/updatesweb/mntner.service";
import {UpdatesWebModule} from "../../../src/app/updatesweb/updateweb.module";
import {IMntByModel} from "../../../src/app/shared/whois-response-type.model";
import {RestService} from "../../../src/app/updatesweb/rest.service";
import {WhoisResourcesService} from "../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";
import * as _ from "lodash";

describe("MntnerService", () => {
    let mntnerService: MntnerService;
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
            imports: [UpdatesWebModule],
            providers: [
                MntnerService,
                RestService,
                PrefixService,
                WhoisResourcesService,
                WhoisMetaService,
                { provide: CredentialsService, useValue: credentialServiceMock},
                { provide: "ModalService", useValue: {}},
                { provide: "PrefixService", useValue: {}},
                // because of RestService
                { provide: Router, useValue: {navigate:() => {}, navigateByUrl: () => {}, events: of()}}
            ],
        });
        mntnerService = TestBed.get(MntnerService);
    });

    it("should be loaded", () => {
        expect(mntnerService).toBeDefined();
    });

    it("should enrich mntners with SSO status", () => {

        const ssoMntners: IMntByModel[] = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},
            {type: "mntner", key: "B-MNT", mine: true, auth: ["MD5-PW"]},
        ];
        const objectMntners: IMntByModel[] = [
            {type: "mntner", key: "A-MNT"},
            {type: "mntner", key: "C-MNT"},
        ];

        const enriched = mntnerService.enrichWithSsoStatus(ssoMntners, objectMntners);

        expect(enriched.length).toBe(2);

        expect(enriched[0].type).toBe("mntner");
        expect(enriched[0].key).toBe("A-MNT");
        expect(enriched[0].mine).toBe(true);

        expect(enriched[1].type).toBe("mntner");
        expect(enriched[1].key).toBe("C-MNT");
        expect(enriched[1].mine).toBe(false);
    });

    it("should detect RIPE-NCC mntners", () => {
        const nccMntners = ["ripe-ncc-hm-mnt", "ripe-ncc-end-mnt", "RIPE-NCC-LEGACY-MNT"];
        const ripeOwned = _.filter(nccMntners, (mntnerKey) => {
            return mntnerService.isNccMntner(mntnerKey);
        });

        expect(ripeOwned.length).toEqual(nccMntners.length);
    });

    it("should detect if object is comaintained", () => {
        const attributes = [{name: "mnt-by", value: "RIPE-NCC-LEGACY-MNT"}];
        expect(mntnerService.isComaintained(attributes)).toBe(true);
    });

    it("should detect if object is comaintained with multiple mnts", () => {
        const attributes = [{name: "mnt-by", value: "RIPE-NCC-LEGACY-MNT"}, {name: "mnt-by", value: "SOME-MNT"}];
        expect(mntnerService.isComaintained(attributes)).toBe(true);
    });

    it("should detect if object is NOT comaintained", () => {
        const attributes = [{name: "mnt-by", value: "SOME-MNT"}];
        expect(mntnerService.isComaintained(attributes)).toBe(false);
        expect(mntnerService.isComaintained([])).toBe(false);
    });

    it("should detect non RIPE-NCC mntners", () => {
        const notRipeOwned = _.filter(["test-MNT", "other-mnt"], (mntnerKey) => {
            return mntnerService.isNccMntner(mntnerKey);
        });

        expect(notRipeOwned.length).toEqual(0);
    });

    it("should mark RIPE-NCC-RPSL-MNT as removeable", () => {
        expect(mntnerService.isRemovable("ripe-ncc-rpsl-mnt")).toEqual(true);
        expect(mntnerService.isRemovable("RIPE-NCC-RPSL-MNT")).toEqual(true);
    });

    it("should mark other mntner as removeable", () => {
        expect(mntnerService.isRemovable("test-mnt")).toEqual(true);
        expect(mntnerService.isRemovable("TEST-MNT")).toEqual(true);
    });

    it("should mark other RIPE-NCC mntners as un-removeable", () => {
        expect(mntnerService.isRemovable("RIPE-NCC-HM-MNT")).toEqual(false);
    });

    it("should enrich mntners with new status", () => {

        const originalMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},
            {type: "mntner", key: "B-MNT", mine: true, auth: ["MD5-PW"]},
        ];
        const currentMntners = [
            {type: "mntner", key: "A-MNT"},
            {type: "mntner", key: "C-MNT"},
        ];

        const enriched = mntnerService.enrichWithNewStatus(originalMntners, currentMntners);

        expect(enriched.length).toBe(2);

        expect(enriched[0].type).toBe("mntner");
        expect(enriched[0].key).toBe("A-MNT");
        expect(enriched[0].isNew).toBe(false);

        expect(enriched[1].type).toBe("mntner");
        expect(enriched[1].key).toBe("C-MNT");
        expect(enriched[1].isNew).toBe(true);
    });

    it("should need authentication for SSO mntner", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},
            {type: "mntner", key: "B-MNT", mine: true, auth: ["MD5-PW"]},

        ];
        const objectMntners = [
            {type: "mntner", key: "A-MNT"},
            {type: "mntner", key: "D-MNT"},
        ];
        // need authentication for D-MNT
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(true);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(false);

    });

    it("should need authentication for SSO mntner with different case", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},
        ];
        const objectMntners = [
            {type: "mntner", key: "a-mnt"},
        ];
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(false);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(false);

    });

    it("should need authentication for trusted mntner", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},
        ];
        const objectMntners = [
            {type: "mntner", key: "B-MNT"},
            {type: "mntner", key: "D-MNT"},
        ];

        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(false);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(false);
    });

    it("should RIPE-NCC-RPSL-MNT be ignored while determining if authorisation is needed", () => {
        const ssoMntners: IMntByModel[] = [];
        const objectMntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT"},
            {type: "mntner", key: "B-MNT"},
        ];

        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(false);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(false);
    });

    it("should need authentication for single RIPE-NCC-RPSL-MNT", () => {
        const ssoMntners: IMntByModel[] = [];
        const objectMntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT"},
        ];

        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(false);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(false);
    });

    it("should have authentication when no sso or password", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO"]},

        ];
        const objectMntners = [
            {type: "mntner", key: "D-MNT"},
        ];

        expect(mntnerService.needsPasswordAuthentication(ssoMntners, [], objectMntners)).toBe(true);
        expect(mntnerService.needsPasswordAuthentication(ssoMntners, objectMntners, [])).toBe(true);
    });

    it("should get mntners that support password auth", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO", "MD5-PW"]},
            {type: "mntner", key: "Z-MNT", mine: true, auth: ["SSO", "PGP"]},
        ];
        const objectMntners = [
            {type: "mntner", key: "A-MNT", auth: ["SSO", "MD5-PW"]},
            {type: "mntner", key: "B-MNT", auth: ["SSO", "PGP"]},
            {type: "mntner", key: "C-MNT", auth: ["MD5-PW", "PGP"]},
            {type: "mntner", key: "D-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "E-MNT", auth: ["SSO", "PGP"]},
        ];

        const mntnersWithPasswordCreate = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithPasswordCreate.length).toBe(2);
        expect(mntnersWithPasswordCreate[0].key).toBe("C-MNT");
        expect(mntnersWithPasswordCreate[1].key).toBe("D-MNT");

        const mntnersWithPasswordModify = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithPasswordModify.length).toBe(2);
        expect(mntnersWithPasswordModify[0].key).toBe("C-MNT");
        expect(mntnersWithPasswordModify[1].key).toBe("D-MNT");
    });

    it("should not not return RIPE-NCC-RPSL-MNT as candidate for authentication", () => {
        const ssoMntners: IMntByModel[] = [];
        const objectMntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "A-MNT", auth: ["MD5-PW"]},
        ];

        const mntnersWithPasswordCreate = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithPasswordCreate.length).toBe(1);
        expect(mntnersWithPasswordCreate[0].key).toBe("A-MNT");

        const mntnersWithPasswordModify = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithPasswordModify.length).toBe(1);
        expect(mntnersWithPasswordModify[0].key).toBe("A-MNT");

    });

    it("should get mntners that do not support password auth", () => {
        const ssoMntners = [
            {type: "mntner", key: "A-MNT", mine: true, auth: ["SSO", "MD5-PW"]},
            {type: "mntner", key: "Y-MNT", mine: true, auth: ["SSO", "PGP"]},
        ];
        const objectMntners = [
            {type: "mntner", key: "A-MNT", auth: ["SSO", "MD5-PW"]},
            {type: "mntner", key: "B-MNT", auth: ["SSO", "PGP"]},
            {type: "mntner", key: "C-MNT", auth: ["MD5-PW", "PGP"]},
            {type: "mntner", key: "D-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "E-MNT", auth: ["SSO", "PGP"]},

        ];

        const mntnersWithoutPasswordCreate = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithoutPasswordCreate.length).toBe(2);
        expect(mntnersWithoutPasswordCreate[0].key).toBe("B-MNT");
        expect(mntnersWithoutPasswordCreate[1].key).toBe("E-MNT");

        const mntnersWithoutPasswordModify = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithoutPasswordModify.length).toBe(2);
        expect(mntnersWithoutPasswordModify[0].key).toBe("B-MNT");
        expect(mntnersWithoutPasswordModify[1].key).toBe("E-MNT");
    });

    it("should not not return RIPE-NCC-RPSL-MNT as candidate not eligible for authentication", () => {
        const ssoMntners: IMntByModel[] = [];
        const objectMntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT", auth: ["SSO", "MD5-PW"]},
            {type: "mntner", key: "A-MNT", auth: ["SSO"]},
        ];

        const mntnersWithoutPasswordCreate = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithoutPasswordCreate.length).toBe(1);
        expect(mntnersWithoutPasswordCreate[0].key).toBe("A-MNT");

        const mntnersWithoutPasswordModify = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithoutPasswordModify.length).toBe(1);
        expect(mntnersWithoutPasswordModify[0].key).toBe("A-MNT");

    });

    it("should ensure NCC mntners are stripped and duplicates removed", () => {
        const ssoMntners = [
            {type: "mntner", key: "C-MNT", mine: true, auth: ["SSO", "MD5-PW"]},
        ];
        const objectMntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "A-MNT", auth: ["SSO"]},
            {type: "mntner", key: "A-MNT", auth: ["SSO"]},
            {type: "mntner", key: "RIPE-NCC-END-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "F-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "F-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "C-MNT", auth: ["SSO", "MD5-PW"]},
        ];

        const mntnersWithoutPasswordCreate = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithoutPasswordCreate.length).toBe(1);
        expect(mntnersWithoutPasswordCreate[0].key).toBe("A-MNT");

        const mntnersWithoutPasswordModify = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithoutPasswordModify.length).toBe(1);
        expect(mntnersWithoutPasswordModify[0].key).toBe("A-MNT");

        const mntnersWithPasswordCreate = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
        expect(mntnersWithPasswordCreate.length).toBe(1);
        expect(mntnersWithPasswordCreate[0].key).toBe("F-MNT");

        const mntnersWithPasswordModify = mntnerService.getMntnersForPasswordAuthentication(ssoMntners, objectMntners, []);
        expect(mntnersWithPasswordModify.length).toBe(1);
        expect(mntnersWithPasswordModify[0].key).toBe("F-MNT");
    });

    it("should return true with single mntner that is RPSL and false otherwise", () => {
        let mntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "A-MNT", auth: ["SSO"]},
            {type: "mntner", key: "RIPE-NCC-END-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "F-MNT", auth: ["MD5-PW"]},
            {type: "mntner", key: "C-MNT", auth: ["SSO", "MD5-PW"]},
        ];
        expect(mntnerService.isLoneRpslMntner(mntners)).toBeFalsy();

        mntners = [
            {type: "mntner", key: "RIPE-NCC-RPSL-MNT", auth: ["MD5-PW"]},
        ];
        expect(mntnerService.isLoneRpslMntner(mntners)).toBeTruthy();
    });
});
