import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {Location} from "@angular/common";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {of} from "rxjs";
import {AlertsComponent} from "../../../src/app/shared/alert/alerts.component";
import {PreferenceService} from "../../../src/app/updates/preference.service";
import {WhoisResourcesService} from "../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";
import {RestService} from "../../../src/app/updates/rest.service";
import {AlertsService} from "../../../src/app/shared/alert/alerts.service";
import {ErrorReporterService} from "../../../src/app/updates/error-reporter.service";
import {MessageStoreService} from "../../../src/app/updates/message-store.service";
import {RpslService} from "../../../src/app/updatestext/rpsl.service";
import {MntnerService} from "../../../src/app/updates/mntner.service";
import {TextCommonsService} from "../../../src/app/updatestext/text-commons.service";
import {CredentialsService} from "../../../src/app/shared/credentials.service";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";
import {WINDOW} from "../../../src/app/core/window.service";
import {TextMultiComponent} from "../../../src/app/updatestext/text-multi.component";
import {SerialExecutorService} from "../../../src/app/updatestext/serial-executor.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {AutoKeyLogicService} from "../../../src/app/updatestext/auto-key-logic.service";

describe("TextMultiComponent", () => {
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<TextMultiComponent>;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let preferencesServiceMock: any;
    let routerMock: any;
    let modalMock: any;
    let credentialsServiceMock: any;
    let textMultiComponent: TextMultiComponent;
    let whoisResources: WhoisResourcesService;

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj("PreferenceService", ["isTextMode", "setTextMode", "isWebMode", "setWebMode"]);
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});
        credentialsServiceMock = jasmine.createSpyObj("CredentialsService", ["hasCredentials", "getCredentials"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, DiffMatchPatchModule, FormsModule],
            declarations: [TextMultiComponent, AlertsComponent],
            providers: [
                {provide: PreferenceService, useValue: preferencesServiceMock},
                SerialExecutorService,
                PropertiesService,
                AutoKeyLogicService,
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                AlertsService,
                ErrorReporterService,
                MessageStoreService,
                RpslService,
                MntnerService,
                TextCommonsService,
                {provide: CredentialsService, useValue: credentialsServiceMock},
                PrefixService,
                {provide: NgbModal, useValue: modalMock},
                { provide: Location, useValue: {}},
                {provide: WINDOW, useValue: {}},
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        }
                    }
                }

            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        whoisResources = TestBed.get(WhoisResourcesService);
        componentFixture = TestBed.createComponent(TextMultiComponent);
        textMultiComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should switch to switch to pre-view when rpsl objects are found", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = true;
        textMultiComponent.objects.rpsl = "person: test person\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.textMode).toBe(false);
    });

    it("should not switch to switch to pre-view when no rpsl objects where found", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = true;
        textMultiComponent.objects.rpsl = "";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.textMode).toBe(true);
        expect(textMultiComponent.alertsComponent.getErrors()[0].plainText).toEqual("No valid RPSL found");
    });

    it("should switch back to text-view", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl = "I don\'t care";
        textMultiComponent.objects.objects = [{}, {}, {}];

        textMultiComponent.setTextMode();

        expect(textMultiComponent.textMode).toBe(true);
        expect(textMultiComponent.objects.objects.length).toBe(0);
    });

    it("should extract the rpsl, type and name for each object indepent of capitalisation", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me\n" +
            "\n" +
            "MNTNER: Him\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(2);

        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].rpsl).toBe("person: Me\n");

        expect(textMultiComponent.objects.objects[1].type).toBe("mntner");
        expect(textMultiComponent.objects.objects[1].name).toBeUndefined();
        expect(textMultiComponent.objects.objects[1].rpsl).toBe("mntner: Him\n");
    });

    it("should report a syntactically invalid object: unknown attribute", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me\n" +
            "bibaboe: xyz\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].status).toBe("Invalid syntax");
        expect(textMultiComponent.objects.objects[0].success).toBe(false);

        expect(textMultiComponent.objects.objects[0].errors.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].errors[0].plainText).toBe("bibaboe: Unknown attribute");
    });

    it("should report a syntactically invalid objec: missing mandatory attribute", () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me Me\n" +
            "address: xyz\n" +
            "phone:+316\n" +
            "mnt-by: TEST-MMT";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].status).toBe("Invalid syntax");
        expect(textMultiComponent.objects.objects[0].success).toBe(false);

        expect(textMultiComponent.objects.objects[0].errors.length).toBe(2);
        expect(textMultiComponent.objects.objects[0].errors[0].plainText).toBe("nic-hdl: Missing mandatory attribute");
        expect(textMultiComponent.objects.objects[0].errors[1].plainText).toBe("source: Missing mandatory attribute");
    });

    it("should determine the action for a non existing valid 'AUTO-1'-object without a fetch", async () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me Me\n" +
            "address: xyz\n" +
            "phone:+316\n" +
            "nic-hdl: AUTO-1\n" +
            "mnt-by: TEST-MMT\n" +
            "source: RIPE\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBe("AUTO-1");
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(0);

        // Not expect fetch returning 404: help this system to resolve the promise
        await componentFixture.whenStable();


        expect(textMultiComponent.objects.objects[0].success).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].status).toBe("Object does not yet exist");
        expect(textMultiComponent.objects.objects[0].action).toBe("create");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBe("textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20AUTO-1%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A");

    });

    it("should determine the action for a pre-existing valid object (uses fetch)", async () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me Me\n" +
            "address: xyz\n" +
            "phone:+316\n" +
            "nic-hdl: MM1-RIPE\n" +
            "mnt-by: TEST-MMT\n" +
            "source: RIPE\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBe("MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].status).toBe("Fetching");
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(0);

        // expect fetch returning 404
        await componentFixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true" }).flush(successResponse);
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].rpslOriginal).toBeDefined();
        expect(textMultiComponent.objects.objects[0].success).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].action).toBe("modify");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBe("webupdates/display/RIPE/person/MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBe("textupdates/modify/RIPE/person/MM1-RIPE?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20xyz%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A");
        expect(textMultiComponent.objects.objects[0].status).toBe("Object exists");

    });

    it("should mark object as failed when non 404 is returned", async () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me Me\n" +
            "address: xyz\n" +
            "phone:+316\n" +
            "nic-hdl: MM1-RIPE\n" +
            "mnt-by: TEST-MMT\n" +
            "source: RIPE\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBe("MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].status).toBe("Fetching");
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(0);

        // Non 404
        await componentFixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true" }).flush(errorResponse, {statusText: "bad", status: 400});
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].rpslOriginal).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].success).toBe(false);
        expect(textMultiComponent.objects.objects[0].exists).toBe(undefined);
        expect(textMultiComponent.objects.objects[0].action).toBe("create");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].status).toBe("Error fetching");
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].errors[0].plainText).toBe("Not authenticated");
    });

    it("should determine the action for non-existing valid object (uses fetch)", async () => {
        componentFixture.detectChanges();

        textMultiComponent.textMode = false;
        textMultiComponent.objects.rpsl =
            "person: Me Me\n" +
            "address: Amsterdam\n" +
            "phone:+316\n" +
            "nic-hdl: MM1-RIPE\n" +
            "mnt-by: TEST-MMT\n" +
            "source: RIPE\n";

        textMultiComponent.setWebMode();

        expect(textMultiComponent.objects.objects.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].type).toBe("person");
        expect(textMultiComponent.objects.objects[0].name).toBe("MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].status).toBe("Fetching");
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(0);

        await componentFixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/MM1-RIPE?unfiltered=true&unformatted=true" }).flush(errorResponse, {statusText: "bad", status: 404});
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].rpslOriginal).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].success).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].action).toBe("create");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBe("textupdates/create/RIPE/person?noRedirect=true&rpsl=person%3A%20Me%20Me%0Aaddress%3A%20Amsterdam%0Aphone%3A%2B316%0Anic-hdl%3A%20MM1-RIPE%0Amnt-by%3A%20TEST-MMT%0Asource%3A%20RIPE%0A");
        expect(textMultiComponent.objects.objects[0].status).toBe("Object does not yet exist");
    });

    it("should not perform an update for syntactically failed objects", () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push({
            action: undefined,
            type: "person",
            name: undefined,
            status: "Invalid syntax",
            success: false,
            errors: [{},{},{}]
        });

        textMultiComponent.submit();

        // No update performed
    });

    it("should perform a create for non-existing objects", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push({
            action: "create",
            exists:false,
            type: "person",
            name: "AUTO-1",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"AUTO-1"}]),
            success: undefined,
            errors:[]
        });

        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "POST", url: "api/whois/RIPE/person?unformatted=true" }).flush(successResponse);
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Create success");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBe("webupdates/display/RIPE/person/MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        // verify RPSL is rewritten to prevent second create
        expect(textMultiComponent.objects.objects[0].rpsl).toBe(
            "person:Me Me\n"+
            "address:Amsterdam\n"+
            "phone:+316\n"+
            "nic-hdl:MM1-RIPE\n"+
            "mnt-by:TEST-MNT\n"+
            "created:2015-12-28T09:10:20Z\n"+
            "last-modified:2015-12-28T09:12:25Z\n"+
            "source:RIPE\n");
        expect(textMultiComponent.objects.objects[0].showDiff).toBeFalsy();

    });

    it("should report an error upon create-failure", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push({
            action: "create",
            exists: false,
            type: "person",
            name: "AUTO-1",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"AUTO-1"}]),
            success: undefined,
            errors:[]
        });
        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "POST", url: "api/whois/RIPE/person?unformatted=true" }).flush(errorResponse, {status: 400, statusText: "bad"});
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Create error");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].errors.length).toBe(1);
        expect(textMultiComponent.objects.objects[0].errors[0].plainText).toBe("Not authenticated");
        expect(textMultiComponent.objects.objects[0].showDiff).toBeFalsy();

    });

    it("should perform a modify for existing objects", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push({
            action: "modify",
            type: "person",
            name: "MM1-RIPE",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"MM1-RIPE"}]),
            success: undefined,
            errors:[]
        });

        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/person/MM1-RIPE?unformatted=true" }).flush(successResponse);
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Modify success");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBe("webupdates/display/RIPE/person/MM1-RIPE");
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].showDiff).toBe(true);
        expect(textMultiComponent.objects.objects[0].rpsl).toBe(
            "person:Me Me\n"+
            "address:Amsterdam\n"+
            "phone:+316\n"+
            "nic-hdl:MM1-RIPE\n"+
            "mnt-by:TEST-MNT\n"+
            "created:2015-12-28T09:10:20Z\n"+
            "last-modified:2015-12-28T09:12:25Z\n"+
            "source:RIPE\n");
    });

    it("should report an error upon modify-failure", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push( {
            action: "modify",
            type: "person",
            name: "MM1-RIPE",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"MM1-RIPE"}]),
            success: undefined,
            errors:[]
        });

        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/person/MM1-RIPE?unformatted=true" }).flush(errorResponse, {status: 403, statusText: "bad"});
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Modify error");
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].showDiff).toBeFalsy();

    });


    it("should perform a delete for existing object", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push({
            action: "modify",
            type: "person",
            name: "MM1-RIPE",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"MM1-RIPE"}]),
            success: undefined,
            deleteReason:"just because",
            passwords:["secret"],
            errors:[]
        });

        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "DELETE", url: "api/whois/RIPE/person/MM1-RIPE?dry-run=false&reason=just%20because&password=secret" }).flush(successResponse);
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Delete success");
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].showDiff).toBeFalsy();
        expect(textMultiComponent.objects.objects[0].rpsl).toBe(
            "person:Me Me\n"+
            "address:Amsterdam\n"+
            "phone:+316\n"+
            "nic-hdl:MM1-RIPE\n"+
            "mnt-by:TEST-MNT\n"+
            "created:2015-12-28T09:10:20Z\n"+
            "last-modified:2015-12-28T09:12:25Z\n"+
            "source:RIPE\n" +
            "delete:just because\n" +
            "password:secret\n");
    });

    it("should report an error upon delete-failure", async () => {
        componentFixture.detectChanges();

        textMultiComponent.objects.objects = [];
        textMultiComponent.objects.objects.push( {
            action: "modify",
            type: "person",
            name: "MM1-RIPE",
            attributes: whoisResources.wrapAndEnrichAttributes("person", [ {name: "person", value: "Me Me"}, {name:"nic-hdl", value:"MM1-RIPE"}]),
            success: undefined,
            deleteReason:"just because",
            passwords:["secret"],
            errors:[]
        });
        textMultiComponent.submit();
        await componentFixture.whenStable();
        httpMock.expectOne({method: "DELETE", url: "api/whois/RIPE/person/MM1-RIPE?dry-run=false&reason=just%20because&password=secret" }).flush(errorResponse, {status: 403, statusText: "bad"});
        await componentFixture.whenStable();

        expect(textMultiComponent.objects.objects[0].status).toBe("Delete error");
        expect(textMultiComponent.objects.objects[0].textupdatesUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].displayUrl).toBeUndefined();
        expect(textMultiComponent.objects.objects[0].showDiff).toBeFalsy();

    });


    const errorResponse = {
        errormessages: {
            errormessage: [
                {severity: "Error", text: "Not authenticated"}
            ]
        }
    };

    const successResponse = {
        objects: {
            object: [
                {
                    "primary-key": {attribute: [{name: "nic-hdl", value: "MM1-RIPE"}]},
                    attributes: {
                        attribute: [
                            {name: "person",  value: "Me Me"},
                            {name: "address", value: "Amsterdam"},
                            {name: "phone",   value: "+316"},
                            {name: "nic-hdl", value: "MM1-RIPE"},
                            {name: "mnt-by",  value: "TEST-MNT"},
                            {name: "created",  value: "2015-12-28T09:10:20Z"},
                            {name: "last-modified",  value: "2015-12-28T09:12:25Z"},
                            {name: "source",  value: "RIPE"}
                        ]
                    }
                }
            ]
        }
    };
});
