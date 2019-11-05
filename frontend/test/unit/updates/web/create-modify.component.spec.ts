import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {CookieService} from "ngx-cookie-service";
import {of} from "rxjs";
import {CreateModifyComponent} from "../../../../src/app/updates/web/create-modify.component";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CoreModule} from "../../../../src/app/core/core.module";
import {PrefixService} from "../../../../src/app/domainobject/prefix.service";
import {ResourceStatusService} from "../../../../src/app/myresources/resource-status.service";
import {WebUpdatesCommonsService} from "../../../../src/app/updates/web/web-updates-commons.service";
import {PropertiesService} from "../../../../src/app/properties.service";
import {OrganisationHelperService} from "../../../../src/app/updates/web/organisation-helper.service";
import {WhoisResourcesService} from "../../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../../src/app/shared/whois-meta.service";
import {RestService} from "../../../../src/app/updates/rest.service";
import {MessageStoreService} from "../../../../src/app/updates/message-store.service";
import {MntnerService} from "../../../../src/app/updates/mntner.service";
import {ErrorReporterService} from "../../../../src/app/updates/error-reporter.service";
import {LinkService} from "../../../../src/app/updates/link.service";
import {PreferenceService} from "../../../../src/app/updates/preference.service";
import {EnumService} from "../../../../src/app/updates/web/enum.service";
import {CharsetToolsService} from "../../../../src/app/updates/charset-tools.service";
import {ScreenLogicInterceptorService} from "../../../../src/app/updates/screen-logic-interceptor.service";
import {AttributeMetadataService} from "../../../../src/app/attribute/attribute-metadata.service";
import {AttributeSharedService} from "../../../../src/app/attribute/attribute-shared.service";

describe("CreateModifyComponent", () => {

    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateModifyComponent>;
    let component: CreateModifyComponent;
    let routerMock: any;
    let modalMock: any;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                NgSelectModule,
                NgOptionHighlightModule,
                HttpClientTestingModule],
            declarations: [CreateModifyComponent],
            providers: [
                PrefixService,
                ResourceStatusService,
                WebUpdatesCommonsService,
                PropertiesService,
                OrganisationHelperService,
                WhoisResourcesService,
                AttributeSharedService,
                AttributeMetadataService,
                WhoisMetaService,
                RestService,
                MessageStoreService,
                MntnerService,
                ErrorReporterService,
                LinkService,
                PreferenceService,
                CookieService,
                EnumService,
                CharsetToolsService,
                ScreenLogicInterceptorService,
                { provide: Location, useValue: {path: () => ("")}},
                { provide: Router, useValue: routerMock},
                { provide: ActivatedRoute, useValue: {snapshot: {
                    paramMap: {},
                    queryParamMap: {has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])}}}},
                { provide: NgbModal, useValue: modalMock}
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(CreateModifyComponent);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe("with TEST-MNT", () => {
        const SOURCE = "RIPE";
        const OBJECT_TYPE = "as-block";

        beforeEach(async () => {
            TestBed.get(ActivatedRoute).snapshot.paramMap = {
                source: SOURCE, objectType: OBJECT_TYPE,
                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])
            };
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush(USER_MAINTAINERS_MOCK);
            await fixture.whenStable();
        });

        it("should get objectType from url", () => {
            expect(component.objectType).toBe(OBJECT_TYPE);
        });

        it("should get source from url", async () => {
            await fixture.whenStable();
            expect(component.source).toBe(SOURCE);
        });

        it("should populate mntner data", () => {
            expect(component.maintainers.sso.length).toBe(1);
            expect(component.maintainers.objectOriginal.length).toBe(0);
            expect(component.maintainers.object.length).toBe(1);

            expect(component.maintainers.sso[0].key).toEqual("TEST-MNT");
            expect(component.maintainers.sso[0].type).toEqual("mntner");
            expect(component.maintainers.sso[0].auth).toEqual(["SSO"]);
            expect(component.maintainers.sso[0].mine).toEqual(true);

            expect(component.maintainers.object[0].key).toEqual("TEST-MNT");
            expect(component.maintainers.object[0].type).toEqual("mntner");
            expect(component.maintainers.object[0].auth).toEqual(["SSO"]);
            expect(component.maintainers.object[0].mine).toEqual(true);

            expect(component.attributes.length).toBe(4);
            // there is is an attribute with a null value in the set
            expect(component.attributes[2].name).toEqual("mnt-by");
            expect(component.attributes[2].value).toEqual("TEST-MNT");
        });

        it("should populate the ui based on object-type meta model and source", () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get("objectName")

            expect(component.attributes.getSingleAttributeOnName("as-block").$$error).toBeUndefined();
            expect(component.attributes.getAllAttributesWithValueOnName("mnt-by")[0].value).toEqual("TEST-MNT");
            expect(component.attributes.getSingleAttributeOnName("source").value).toEqual("RIPE");

            expect(component.activatedRoute.snapshot.paramMap.get("objectName")).toBe(stateBefore);
        });


        it("should display field specific errors upon submit click on form with missing values", () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get("objectName");

            component.submit();
            expect(component.attributes.getSingleAttributeOnName("as-block").$$error).toEqual("Mandatory attribute not set");
            expect(component.attributes.getSingleAttributeOnName("as-block").value).toEqual("");

            expect(component.attributes.getSingleAttributeOnName("source").value).toEqual("RIPE");

            expect(component.activatedRoute.snapshot.paramMap.get("objectName")).toBe(stateBefore);

        });

        it("should handle success post upon submit click when form is complete", async () => {
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            "primary-key": {attribute: [{name: "as-block", value: "MY-AS-BLOCK"}]},
                            attributes: {
                                attribute: [
                                    {name: "as-block", value: "MY-AS-BLOCK"},
                                    {name: "mnt-by", value: "TEST-MNT"},
                                    {name: "source", value: "RIPE"}
                                ]
                            }
                        }
                    ]
                }
            };

            component.credentialsService.setCredentials("TEST-MNT", "@123");
            component.attributes.setSingleAttributeOnName("as-block", "A");
            component.submit();

            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/as-block?password=@123"}).flush(DUMMY_RESPONSE);
            fixture.detectChanges();

            const resp = component.messageStoreService.get("MY-AS-BLOCK");
            expect(resp.getPrimaryKey()).toEqual("MY-AS-BLOCK");
            const attrs = component.whoisResourcesService.wrapAttributes(resp.getAttributes());
            expect(attrs.getSingleAttributeOnName("as-block").value).toEqual("MY-AS-BLOCK");
            expect(attrs.getAllAttributesOnName("mnt-by")[0].value).toEqual("TEST-MNT");
            expect(attrs.getSingleAttributeOnName("source").value).toEqual("RIPE");

            await fixture.whenStable();
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith("webupdates/display/RIPE/as-block/MY-AS-BLOCK?method=Create");
        });


        it("should handle error post upon submit click when form is complete", async () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get("objectName");

            component.attributes.setSingleAttributeOnName("as-block", "A");
            component.submit();

            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/as-block"}).flush(WHOIS_OBJECT_WITH_ERRORS_MOCK, {status: 400, statusText: "error"});
            await fixture.whenStable();

            expect(component.alertService.errors[0].plainText).toEqual("Unrecognized source: INVALID_SOURCE");
            expect(component.alertService.warnings[0].plainText).toEqual("Not authenticated");
            expect(component.attributes.getSingleAttributeOnName("as-block").$$error).toEqual("\'MY-AS-BLOCK\' is not valid for this object type");

            expect(component.activatedRoute.snapshot.paramMap.get("objectName")).toBe(stateBefore);
        });

        it("should reload defaults after error", async () => {
            component.attributes.setSingleAttributeOnName("as-block", "A");
            component.submit();

            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/as-block"}).flush(WHOIS_OBJECT_WITH_ERRORS_MOCK, {status: 400, statusText: "error"});
            await fixture.whenStable();

            expect(component.alertService.errors[0].plainText).toEqual("Unrecognized source: INVALID_SOURCE");
            expect(component.alertService.warnings[0].plainText).toEqual("Not authenticated");
            expect(component.attributes.getSingleAttributeOnName("as-block").$$error).toEqual("\'MY-AS-BLOCK\' is not valid for this object type");

            expect(component.attributes.getSingleAttributeOnName("source").$$meta.$$disable).toEqual(true);
        });


        it("should duplicate attribute", () => {
            const lengthBefore = component.attributes.length;

            component.duplicateAttribute(component.attributes[1]);
            expect(component.attributes.length).toEqual(lengthBefore + 1);
            expect(component.attributes[2].name).toEqual(component.attributes[1].name);
            expect(component.attributes[2].value).toEqual(undefined);

            // and again, just 2b sure.
            component.duplicateAttribute(component.attributes[1]);
            expect(component.attributes.length).toEqual(lengthBefore + 2);
            expect(component.attributes[2].name).toEqual(component.attributes[1].name);
            expect(component.attributes[2].value).toEqual(undefined);
        });

        it("should remove attribute", () => {
            const lengthBefore = component.attributes.length;
            const currentThird = component.attributes[2];

            component.removeAttribute(component.attributes[1]);

            expect(component.attributes.length).toEqual(lengthBefore-1);
            expect(component.attributes[1].name).toEqual(currentThird.name);
            expect(component.attributes[1].value).toEqual(currentThird.value);
        });


        it("should fetch maintainers already associated to the user in the session", () => {
            expect(component.maintainers.sso[0].key).toEqual(USER_MAINTAINERS_MOCK[0].key);
            expect(component.maintainers.sso[0].type).toEqual(USER_MAINTAINERS_MOCK[0].type);
            expect(component.maintainers.sso[0].auth).toEqual(USER_MAINTAINERS_MOCK[0].auth);
            expect(component.maintainers.sso[0].mine).toEqual(true);

            expect(component.maintainers.sso.length).toBe(1);

            expect(component.maintainers.objectOriginal.length).toBe(0);

            expect(component.maintainers.object[0].key).toEqual(USER_MAINTAINERS_MOCK[0].key);
            expect(component.maintainers.object[0].type).toEqual(USER_MAINTAINERS_MOCK[0].type);
            expect(component.maintainers.object[0].auth).toEqual(USER_MAINTAINERS_MOCK[0].auth);
            expect(component.maintainers.object[0].mine).toEqual(true);

        });

        it("should add the selected maintainers to the object before post it.", async () => {
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [
                                    {name: "as-block", value: "MY-AS-BLOCK"},
                                    {name: "mnt-by", value: "TEST-MNT"},
                                    {name: "mnt-by", value: "TEST-MNT-1"},
                                    {name: "source", value: "RIPE"}
                                ]
                            }
                        }
                    ]
                }
            };
            component.attributes.setSingleAttributeOnName("as-block", "MY-AS-BLOCK");
            component.maintainers.object = [
                {"mine":true,"type":"mntner","auth":["SSO"],"key":"TEST-MNT"},
                {"mine":false,"type":"mntner","auth":["SSO"],"key":"TEST-MNT-1"}
            ];

            component.onMntnerAdded(component.maintainers.object[1]);

            component.submit();
            await fixture.whenStable();
            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/as-block"}).flush(DUMMY_RESPONSE, {status: 500, statusText: "error"});
        });

        it("should ask for password after add non-sso maintainer with password.", () => {
            modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});
            // simulate manual removal of the last and only mntner
            component.maintainers.object = [];
            component.onMntnerRemoved({"mine":true,"type":"mntner","auth":["SSO"],"key":"TEST-MNT"});

            // simulate manual addition of a new mntner with only md5
            component.maintainers.object = [{"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"}];
            component.onMntnerAdded({"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"});

            expect(modalMock.open).toHaveBeenCalled();
        });

        it("should ask for password after upon submit.", () => {
            modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});

            // simulate manual addition of a new mntner with only md5
            component.maintainers.object = [{"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"}];
            component.onMntnerAdded({"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"});

            // simulate manual removal of the last and only mntner
            component.maintainers.object = [];
            component.onMntnerRemoved({"mine":true,"type":"mntner","auth":["SSO"],"key":"TEST-MNT"});

            component.submit();

            expect(modalMock.open).toHaveBeenCalled();
        });

        it("should remove the selected maintainers to the object before post it.", async () => {
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [
                                    {name: "as-block", value: "MY-AS-BLOCK"},
                                    {name: "mnt-by", value: "TEST-MNT"},
                                    {name: "source", value: "RIPE"}
                                ]
                            }
                        }
                    ]
                }
            };
            component.attributes.setSingleAttributeOnName("as-block", "MY-AS-BLOCK");
            component.attributes.addAttrsSorted("mnt-by", ["TEST-MNT-1"]);

            component.maintainers.object = [
                {"mine":true,"type":"mntner","auth":["SSO"],"key":"TEST-MNT"},
                {"mine":false,"type":"mntner","auth":["SSO"],"key":"TEST-MNT-1"}
            ];

            component.onMntnerRemoved(component.maintainers.object[1]);

            component.submit();

            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/as-block"}).flush(DUMMY_RESPONSE, {status: 500, statusText: "error"});
            await fixture.whenStable();
        });

        it("should add a null when removing the last maintainer.", () => {

            component.maintainers.object = [
                {"mine":true,"type":"mntner","auth":["SSO"],"key":"TEST-MNT"}
            ];

            component.onMntnerRemoved(component.maintainers.object[0]);

            expect(component.attributes.getSingleAttributeOnName("mnt-by").value).toEqual("");

        });


        it("should add a new user defined attribute", () => {
            //@ts-ignore
            component.addSelectedAttribute({name:"remarks", value: null}, component.attributes[0]);

            expect(component.attributes[1].name).toEqual("remarks");
            expect(component.attributes[1].value).toBeNull();
        });

        it("should go to delete controler on delete", async () => {
            component.source = "RIPE";
            component.objectType = "MNT";
            component.name = "TEST-MNT";

            component.deleteObject();
            await fixture.whenStable();

            expect(routerMock.navigateByUrl).toHaveBeenCalledWith("webupdates/delete/RIPE/MNT/TEST-MNT?onCancel=webupdates/modify");
        });

        it("should transition to select state if cancel is pressed during create", () => {
            spyOn(window, "confirm").and.returnValue(true);
            component.cancel();
            expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
        });
    });

    describe("with RIPE-NCC-MNT", () => {
        const SOURCE = "RIPE";
        const OBJECT_TYPE = "route";

        beforeEach(async () => {
            TestBed.get(ActivatedRoute).snapshot.paramMap = {
                source: SOURCE, objectType: OBJECT_TYPE,
                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])
            };
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush(USER_RIPE_NCC_MNT_MOCK);
            await fixture.whenStable();
        });

        it("should not be possible to create route objects with RIPE-NCC-RPSL-MNT for out-of-region objects", async () => {

            // for creation and modification of route, route6 and aut-num, password for RIPE-NCC-RPSL-MNT is added to
            // the rest-call to allow creation of "out-of-region"-objects without knowing the details of RPSL-mntner
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            "primary-key": {
                                "attribute": [
                                    {name: "route", value: "193.0.7.231/32"},
                                    {name: "origin", value: "AS1299"}
                                ]
                            },
                            attributes: {
                                attribute: [
                                    {name: "route", value: "193.0.7.231/32"},
                                    {name: "descr", value: "My descr"},
                                    {name: "origin", value: "AS1299"},
                                    {name: "mnt-by", value: "RIPE-NCC-MNT"},
                                    {name: "source", value: "RIPE"}
                                ]
                            }
                        }
                    ]
                },
                errormessages: {
                    errormessage: [{
                            severity: "Error",
                            text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                            args: [{value: "aut-num"}, {value: "AS1299"}, {value: "mnt-by"}, {value: "TELIANET-RR, RIPE-NCC-END-MNT"}]
                        }, {
                            severity: "Warning",
                                text: "This update has only passed one of the two required hierarchical authorisations"
                        }, {
                            severity: "Info",
                                text: "The %s object %s will be saved for one week pending the second authorisation",
                            args: [{value: "route"}, {value: "193.0.7.231/32AS1299"}]
                        }
                    ]}};
            component.attributes.setSingleAttributeOnName("route", "193.0.7.231/32");
            component.attributes.setSingleAttributeOnName("descr", "My descr");
            component.attributes.setSingleAttributeOnName("origin", "AS1299");
            component.attributes.setSingleAttributeOnName("mnt-by", "RIPE-NCC-MNT");
            component.attributes.setSingleAttributeOnName("source", "RIPE");

            component.submit();

            httpMock.expectOne({method: "POST", url: "api/whois/RIPE/route"}).flush(DUMMY_RESPONSE, {status: 400, statusText: "error"});
            await fixture.whenStable();

            const resp = component.messageStoreService.get("193.0.7.231/32AS1299");

            expect(resp.getPrimaryKey()).toEqual("193.0.7.231/32AS1299");
            let attrs = component.whoisResourcesService.wrapAttributes(resp.getAttributes());
            expect(attrs.getSingleAttributeOnName("route").value).toEqual("193.0.7.231/32");
            expect(attrs.getSingleAttributeOnName("origin").value).toEqual("AS1299");
            expect(attrs.getSingleAttributeOnName("descr").value).toEqual("My descr");
            expect(attrs.getAllAttributesOnName("mnt-by")[0].value).toEqual("RIPE-NCC-MNT");
            expect(attrs.getSingleAttributeOnName("source").value).toEqual("RIPE");
            expect(resp.errormessages.errormessage[0].severity).toEqual("Info");
            expect(resp.errormessages.errormessage[0].text).toEqual(
                "Your object is still pending authorisation by a maintainer of the <strong>aut-num</strong> object " +
                "<a target=\"_blank\" href=\"#/webupdates/display/RIPE/aut-num/AS1299\">AS1299</a>. " +
                "Please ask them to confirm, by submitting the same object as outlined below using syncupdates or mail updates, " +
                "and authenticate it using the maintainer " +
                "<a target=\"_blank\" href=\"#/webupdates/display/RIPE/mntner/TELIANET-RR\">TELIANET-RR</a>. " +
                "<a target=\"_blank\" href=\"https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage\">" +
                "Click here for more information</a>.");
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith("webupdates/display/RIPE/route/193.0.7.231%2F32AS1299?method=Pending");
        });
    });

    describe("init with failures", () => {
        const SOURCE = "RIPE";
        const OBJECT_TYPE = "as-block";

        beforeEach(async () => {
            TestBed.get(ActivatedRoute).snapshot.paramMap = {
                source: SOURCE, objectType: OBJECT_TYPE,
                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])
            };
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush({ },{status: 404, statusText: "error"});
            await fixture.whenStable();
        });

        it("should report error when fetching sso maintainers fails", () => {
            expect(component.alertService.hasErrors()).toBe(true);
            expect(component.alertService.errors[0].plainText).toEqual("Error fetching maintainers associated with this SSO account");
        });

    });

    describe("init with nonexistent obj type", () => {
        const SOURCE = "RIPE";
        const OBJECT_TYPE = "blablabla";

        beforeEach(async () => {
            TestBed.get(ActivatedRoute).snapshot.paramMap = {
                source: SOURCE, objectType: OBJECT_TYPE,
                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])
            };
            component = fixture.componentInstance;
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it("should redirect to 404 page", () => {
            expect(routerMock.navigate).toHaveBeenCalledWith(["not-found"]);
        });
    });

    describe("init route object type", () => {
        const SOURCE = "RIPE";
        const OBJECT_TYPE = "route";

        beforeEach(async () => {
            TestBed.get(ActivatedRoute).snapshot.paramMap = {
                source: SOURCE, objectType: OBJECT_TYPE,
                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])
            };
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush(USER_WITH_MORE_ASSOCIATED_MNT_MOCK);
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it("should remove mnt-by on backspace one by one", () => {
            const BACKSPACE_KEYCODE = 8;
            spyOn(component, "onMntnerRemoved").and.callThrough();
            expect(component.maintainers.sso.length).toBe(4); // 4 associated maintainer
            expect(component.maintainers.object.length).toBe(4);
            expect(component.attributes.length).toBe(8);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(4);
            const mntInput = fixture.debugElement.query(By.css("ng-select"));
            triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
            expect(component.onMntnerRemoved).toHaveBeenCalled(); //method which remove mnt-by from attributes
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(3);
            expect(component.attributes.length).toBe(7);
            triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(2);
            expect(component.attributes.length).toBe(6);
        });

        function triggerKeyDownEvent(element: DebugElement, which: number, key = ''): void {
            element.triggerEventHandler('keydown', {
                which: which,
                key: key,
                preventDefault: () => {
                },
            });
        }
    });
});

const USER_MAINTAINERS_MOCK = [
    {"mine":true, "type":"mntner", "auth":["SSO"], "key":"TEST-MNT"}
];
const USER_RIPE_NCC_MNT_MOCK = [
    {"mine": true, "type": "mntner", "auth": ["SSO"], "key": "RIPE-NCC-MNT"}
];
const USER_WITH_MORE_ASSOCIATED_MNT_MOCK = [
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "TE-MNT"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO", "PGPKEY-261AA554", "PGPKEY-F91A0E57"], "key": "MAINT-AFILIAS"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "BBC-MNT"},
    {"mine": true, "type": "mntner", "auth": ["SSO"], "key": "TEST-MNT"}
];

const WHOIS_OBJECT_WITH_ERRORS_MOCK = {
    objects: {
        object: [
            {
                "primary-key": {attribute: [{name: "as-block", value: "MY-AS-BLOCK"}]},
                attributes: {
                    attribute: [
                        {name: "as-block", value: "MY-AS-BLOCK"},
                        {name: "mnt-by", value: "TEST-MNT"},
                        {name: "source", value: "RIPE"}
                    ]
                }
            }
        ]
    },
    errormessages: {
        errormessage: [
            {
                severity: "Error",
                text: "Unrecognized source: %s",
                "args": [{value: "INVALID_SOURCE"}]
            },
            {
                severity: "Warning",
                text: "Not authenticated"
            }, {
                severity: "Error",
                attribute: {
                    name: "as-block",
                    value: "MY-AS-BLOCK"
                },
                text: "\'%s\' is not valid for this object type",
                args: [{value: "MY-AS-BLOCK"}]
            }
        ]
    }
};