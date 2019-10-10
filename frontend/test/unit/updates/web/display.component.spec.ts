import {ComponentFixture, TestBed} from "@angular/core/testing";
import {DisplayComponent} from "../../../../app/ng/updates/web/display.component";
import {MessageStoreService} from "../../../../app/ng/updates/message-store.service";
import {WhoisResourcesService} from "../../../../app/ng/shared/whois-resources.service";
import {MntnerService} from "../../../../app/ng/updates/mntner.service";
import {CredentialsService} from "../../../../app/ng/shared/credentials.service";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {AlertsComponent} from "../../../../app/ng/shared/alert/alerts.component";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {WhoisMetaService} from "../../../../app/ng/shared/whois-meta.service";
import {RestService} from "../../../../app/ng/updates/rest.service";
import {AlertsService} from "../../../../app/ng/shared/alert/alerts.service";
import {UserInfoService} from "../../../../app/ng/userinfo/user-info.service";
import {CookieService} from "ngx-cookie-service";
import {WebUpdatesCommonsService} from "../../../../app/ng/updates/web/web-updates-commons.service";
import {PrefixService} from "../../../../app/ng/domainobject/prefix.service";
import {PropertiesService} from "../../../../app/ng/properties.service";
import {of} from "rxjs";
import {SanitizeImgHtmlPipe} from "../../../../app/ng/shared/sanitize-img-html.pipe";

describe("DisplayComponent", () => {

    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let messageStoreServiceMock: any;

    const OBJECT_TYPE = "as-block";
    const SOURCE = "RIPE";
    const OBJECT_NAME = "MY-AS-BLOCK";
    const MNTNER = "TEST-MNT";

    beforeEach(() => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        messageStoreServiceMock = jasmine.createSpyObj("MessageStoreService", ["get"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, DiffMatchPatchModule],
            declarations: [
                DisplayComponent, AlertsComponent, SanitizeImgHtmlPipe
            ],
            providers: [
                CredentialsService,
                {provide: MessageStoreService, useValue: messageStoreServiceMock},
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        params: of({source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME}),
                        queryParams: of({}),
                    }
                }
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "as-block", value: OBJECT_NAME}]},
                        attributes: {
                            attribute: [
                                {name: "as-block", value: OBJECT_NAME},
                                {name: "mnt-by", value: MNTNER},
                                {name: "source", value: SOURCE}
                            ]
                        }
                    }
                ]
            }
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        if (withFlush) {
            request.flush({
                user: {
                    username: "test@ripe.net",
                    displayName: "Test User",
                    expiryDate: [2015, 9, 9, 14, 9, 27, 863],
                    uuid: "aaaa-bbbb-cccc-dddd",
                    active: true
                }
            });
        }
    };


    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should get source from url", async () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectSource).toBe(SOURCE);
    });

    it("should get objectType from url", () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectType).toBe(OBJECT_TYPE);
    });

    it("should get objectName from url", () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);

        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectName).toBe(OBJECT_NAME);
    });

    it("should detect logged in", async () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);

        fixture.detectChanges();

        expectUserInfo(true);
        await fixture.whenStable();
        expect(component.loggedIn).toBe(true);
    });

    it("should populate the ui from message-store", () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);

        expect(component.attributes.getSingleAttributeOnName("as-block").value).toBe(OBJECT_NAME);
        expect(component.attributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER);
        expect(component.attributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        // FIXME ?
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
        // expect($state.current.name).toBe("webupdates.select");

    });

    it("should populate the ui from rest ok", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({
            method: "GET",
            url: "api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true"
        }).flush(objectToDisplay);

        expect(component.attributes.getSingleAttributeOnName("as-block").value).toBe(OBJECT_NAME);
        expect(component.attributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER);
        expect(component.attributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        // FIXME ?
        // expect($state.current.name).toBe("webupdates.select");
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

    it("should populate the ui from rest failure", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true"}).flush({
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
                    }
                ]
            }
        }, {status: 403, statusText: "error"});


        expect(component.alertService.getErrors()[0].plainText).toEqual("Unrecognized source: INVALID_SOURCE");
        expect(component.alertService.getWarnings()[0].plainText).toEqual("Not authenticated");

        // FIXME ?
        // expect($state.current.name).toBe("webupdates.select");
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);

    });

    it("should navigate to select screen", () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();


        expectUserInfo(true);

        component.navigateToSelect();
        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

    it("should navigate to modify screen", () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);

        component.navigateToModify();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/${OBJECT_TYPE}/${OBJECT_NAME}`);
    });

});

describe("DisplayComponent with object containing slash", () => {

    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let messageStoreServiceMock: any;

    const SOURCE = "RIPE";
    const OBJECT_TYPE = "route";
    const OBJECT_NAME = "212.235.32.0/19AS1680";
    const MNTNER = "TEST-MNT";

    beforeEach(() => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        messageStoreServiceMock = jasmine.createSpyObj("MessageStoreService", ["get"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, DiffMatchPatchModule],
            declarations: [
                DisplayComponent, AlertsComponent, SanitizeImgHtmlPipe
            ],
            providers: [
                CredentialsService,
                {provide: MessageStoreService, useValue: messageStoreServiceMock},
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        params: of({source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME}),
                        queryParams: of({}),
                    }
                }
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "as-block", value: OBJECT_NAME}]},
                        attributes: {
                            attribute: [
                                {name: "route", value: OBJECT_NAME},
                                {name: "mnt-by", value: MNTNER},
                                {name: "source", value: SOURCE}
                            ]
                        }
                    }
                ]
            }
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        if (withFlush) {
            request.flush({
                user: {
                    username: "test@ripe.net",
                    displayName: "Test User",
                    uuid: "aaaa-bbbb-cccc-dddd",
                    active: true
                }
            });
        }
    };

    it("should populate the ui from rest ok", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({
            method: "GET",
            url: "api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true"
        }).flush(objectToDisplay);

        expect(component.attributes.getSingleAttributeOnName("route").value).toBe(OBJECT_NAME);
        expect(component.attributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER);
        expect(component.attributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);
    });

    it("should navigate to modify", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({
            method: "GET",
            url: "api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true"
        }).flush(objectToDisplay);

        component.navigateToModify();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/${OBJECT_TYPE}/${encodeURIComponent(OBJECT_NAME)}`);
    });

    it("should navigate to select", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({
            method: "GET",
            url: "api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true"
        }).flush(objectToDisplay);

        component.navigateToSelect();
        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

});

describe("DisplayComponent for RIPE-NONAUTH aut-num object", () => {

    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let modalMock: any;
    let messageStoreServiceMock: any;

    const SOURCE = "RIPE-NONAUTH";
    const OBJECT_TYPE = "aut-num";
    const OBJECT_NAME = "AS9777";
    const MNTNER = "TEST-MNT";
    const ADMINC = "JYH3-RIPE";

    beforeEach(() => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        messageStoreServiceMock = jasmine.createSpyObj("MessageStoreService", ["get"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, DiffMatchPatchModule],
            declarations: [
                DisplayComponent, AlertsComponent, SanitizeImgHtmlPipe
            ],
            providers: [
                CredentialsService,
                {provide: MessageStoreService, useValue: messageStoreServiceMock},
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        params: of({source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME}),
                        queryParams: of({}),
                    }
                }
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: OBJECT_TYPE, value: OBJECT_NAME}]},
                        attributes: {
                            attribute: [
                                {name: "aut-num", value: OBJECT_NAME},
                                {
                                    name: "mnt-by", value: MNTNER, "referenced-type": "mntner",
                                    link:
                                        {
                                            href: "http://rest-prepdev.db.ripe.net/ripe/mnt-by/TEST-MNT",
                                            type: "locator"
                                        },
                                },
                                {
                                    name: "admin-c", value: ADMINC, "referenced-type": "person",
                                    link:
                                        {
                                            href: "http://rest-prepdev.db.ripe.net/ripe/person/JYH3-RIPE",
                                            type: "locator"
                                        },
                                },
                                {name: "source", value: SOURCE}
                            ]
                        }
                    }
                ]
            }
        });
    });

    afterEach(() => {
       httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        if (withFlush) {
            request.flush({
                user: {
                    username: "test@ripe.net",
                    displayName: "Test User",
                    uuid: "aaaa-bbbb-cccc-dddd",
                    active: true
                }
            });
        }
    };


    it("should add uiHref to attributes with link", () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE-NONAUTH/aut-num/AS9777?unfiltered=true"}).flush(objectToDisplay);

        expect(component.attributes.getSingleAttributeOnName("aut-num").value).toBe(OBJECT_NAME);
        expect(component.attributes.getSingleAttributeOnName("mnt-by").value).toEqual(MNTNER);
        expect(component.attributes.getSingleAttributeOnName("mnt-by").link.uiHref).toEqual("#/webupdates/display/RIPE/mntner/TEST-MNT");
        expect(component.attributes.getSingleAttributeOnName("admin-c").value).toBe(ADMINC);
        expect(component.attributes.getSingleAttributeOnName("admin-c").link.uiHref).toBe("#/webupdates/display/RIPE/person/JYH3-RIPE");
        expect(component.attributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

    });

});
