import {ComponentFixture, TestBed} from "@angular/core/testing";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {WhoisObjectViewerComponent} from "../../../src/app/whois-object/whois-object-viewer.component";
import {QueryComponent} from "../../../src/app/query/query.component";
import {QueryService} from "../../../src/app/query/query.service";
import {QueryParametersService} from "../../../src/app/query/query-parameters.service";
import {CoreModule} from "../../../src/app/core/core.module";
import {LookupComponent} from "../../../src/app/query/lookup.component";
import {TemplateComponent} from "../../../src/app/query/templatecomponent/template.component";
import {of} from "rxjs/internal/observable/of";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";
import {throwError} from "rxjs";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {convertToParamMap} from "@angular/router";
import {IWhoisResponseModel} from "../../../src/app/shared/whois-response-type.model";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {CertificateBannerComponent} from "../../../src/app/banner/certificate-banner.component";
import {CookieService} from "ngx-cookie-service";

const whoisObjectModelMock = {
    "type" : "inetnum",
    "link" : {
        "type" : "locator",
        "href" : "http://rest-prepdev.db.ripe.net/ripe/inetnum/88.208.87.32 - 88.208.87.39"
    },
    "source" : {
        "id" : "ripe"
    },
    "primary-key" : {
        "attribute" : [ {
            "name" : "inetnum",
            "value" : "88.208.87.32 - 88.208.87.39"
        } ]
    },
    "attributes" : {
        "attribute" : [ {
            "name" : "inetnum",
            "value" : "88.208.87.32 - 88.208.87.39"
        }, {
            "name" : "netname",
            "value" : "SEVEn"
        }, {
            "name" : "descr",
            "value" : "SEVEn, Stredisko pro efektivni vyuzivani energie, o.p.s."
        }, {
            "name" : "country",
            "value" : "CZ"
        }, {
            "link" : {
                "type" : "locator",
                "href" : "http://rest-prepdev.db.ripe.net/ripe/person/MK6313-RIPE"
            },
            "name" : "admin-c",
            "value" : "MK6313-RIPE",
            "referenced-type" : "person"
        }, {
            "link" : {
                "type" : "locator",
                "href" : "http://rest-prepdev.db.ripe.net/ripe/role/DIAL666-RIPE"
            },
            "name" : "tech-c",
            "value" : "DIAL666-RIPE",
            "referenced-type" : "role"
        }, {
            "name" : "status",
            "value" : "ASSIGNED PA"
        }, {
            "link" : {
                "type" : "locator",
                "href" : "http://rest-prepdev.db.ripe.net/ripe/mntner/DIALTELECOM-MNT"
            },
            "name" : "mnt-by",
            "value" : "DIALTELECOM-MNT",
            "referenced-type" : "mntner"
        }, {
            "name" : "created",
            "value" : "2008-08-21T16:06:04Z"
        }, {
            "name" : "last-modified",
            "value" : "2011-06-07T07:17:34Z"
        }, {
            "name" : "source",
            "value" : "RIPE"
        } ]
    },
    "tags" : {
        "tag" : [ {
            "id" : "RIPE-USER-RESOURCE"
        } ]
    },
    "resource-holder": {
        "key" : "ORG-IA8-RIPE",
        "name" : "Dial Telecom, a.s."
    },
    "abuse-contact" : {
        "key" : "AR14411-RIPE",
        "email" : "abuse@dialtelecom.cz",
        "suspect" : false,
        "org-id" : "ORG-IA8-RIPE"
    },
    "managed" : false
};

const mockTemplateAutnum =
    "aut-num:        [mandatory]  [single]     [primary/lookup key]\n" +
    "as-name:        [mandatory]  [single]     [ ]\n" +
    "descr:          [optional]   [multiple]   [ ]\n" +
    "member-of:      [optional]   [multiple]   [inverse key]\n" +
    "import-via:     [optional]   [multiple]   [ ]\n" +
    "import:         [optional]   [multiple]   [ ]\n" +
    "mp-import:      [optional]   [multiple]   [ ]\n" +
    "export-via:     [optional]   [multiple]   [ ]\n" +
    "export:         [optional]   [multiple]   [ ]\n" +
    "mp-export:      [optional]   [multiple]   [ ]\n" +
    "default:        [optional]   [multiple]   [ ]\n" +
    "mp-default:     [optional]   [multiple]   [ ]\n" +
    "remarks:        [optional]   [multiple]   [ ]\n" +
    "org:            [optional]   [single]     [inverse key]\n" +
    "sponsoring-org: [optional]   [single]     [ ]\n" +
    "admin-c:        [mandatory]  [multiple]   [inverse key]\n" +
    "tech-c:         [mandatory]  [multiple]   [inverse key]\n" +
    "abuse-c:        [optional]   [single]     [inverse key]\n" +
    "status:         [generated]  [single]     [ ]\n" +
    "notify:         [optional]   [multiple]   [inverse key]\n" +
    "mnt-lower:      [optional]   [multiple]   [inverse key]\n" +
    "mnt-routes:     [optional]   [multiple]   [inverse key]\n" +
    "mnt-by:         [mandatory]  [multiple]   [inverse key]\n" +
    "created:        [generated]  [single]     [ ]\n" +
    "last-modified:  [generated]  [single]     [ ]\n" +
    "source:         [mandatory]  [single]     [ ]\n";

describe("QueryComponent", () => {

    let component: QueryComponent;
    let fixture: ComponentFixture<QueryComponent>;
    let queryServiceSpy: jasmine.SpyObj<QueryService>;
    let userInfoService: any;
    let whoisMetaService: WhoisMetaService;
    let queryParametersService: QueryParametersService;

    beforeEach(() => {
        queryServiceSpy = jasmine.createSpyObj("QueryService", ["searchWhoisObjects", "searchTemplate", "buildQueryStringForLink", "buildPermalink"]);
        TestBed.configureTestingModule({
            imports: [ SharedModule, CoreModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
            declarations: [
                QueryComponent,
                CertificateBannerComponent,
                LookupComponent,
                TemplateComponent,
                WhoisObjectViewerComponent,
            ],
            providers: [
                { provide: QueryService, useValue: queryServiceSpy},
                WhoisMetaService,
                QueryParametersService,
                PropertiesService,
                CookieService,
                { provide: UserInfoService,
                    useValue: {
                        isLogedIn: () => true,
                        getLoggedInUser: () => of(),
                        getSelectedOrganisation: () => of(),
                        userLoggedIn$: of()}},
            ]
        });
        whoisMetaService = TestBed.inject(WhoisMetaService);
        queryParametersService = TestBed.inject(QueryParametersService);
        userInfoService = TestBed.inject(UserInfoService);

        expect(whoisMetaService).toBeDefined();
        expect(queryParametersService).toBeDefined();
        expect(userInfoService).toBeDefined();

        fixture = TestBed.createComponent(QueryComponent);
        component = fixture.componentInstance;
        spyOn(component.router, "navigate");
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("with no query string", () => {

        it("should set up default options for querying", () => {
            component.init();
            fixture.detectChanges();
            expect(component.results.length).toEqual(0);
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.source).toEqual("RIPE");
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
        });
    });

    describe("with a single search term", () => {

        const successResponse: IWhoisResponseModel = {
            objects: {
                //@ts-ignore
                object: [{}, {}, {}, {}]
            }
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(of(successResponse));
        });

        it("should parse the options into the form", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                    searchtext: " 193.0.0.0 ",
                    types: "inetnum;inet6num",
                    inverse: "",
                    hierarchyFlag: "exact",
                    rflag: "false",
                    dflag: "true",
                    bflag: "",
                    source: "TEST",
                    get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                    has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
                } )} ;

            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual("193.0.0.0");
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(true);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual("TEST");
            expect(component.whoisCliQuery()).toEqual("-T inetnum,inet6num -xd --sources TEST 193.0.0.0");
            expect(component.results.length).toEqual(4);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it("should handle an empty search string", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: "",
                types: "inetnum;inet6num",
                inverse: "",
                hierarchyFlag: "exact",
                rflag: "false",
                dflag: "",
                bflag: "",
                source: "TEST",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual("");
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual("TEST");
            expect(component.whoisCliQuery().trim()).toEqual("");

            component.doSearch();
            expect(component.results.length).toEqual(0);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(0);
        });

        it("should handle empty params", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: " 193.0.0.0 ",
                types: "",
                inverse: undefined,
                hierarchyFlag: undefined,
                bflag: "true",
                rflag: "true",
                dflag: "false",
                source: "GRS",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual("193.0.0.0");
            expect(component.qp.showFullObjectDetails).toEqual(true);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual("GRS");
            expect(component.whoisCliQuery().trim()).toEqual("-Br --resource 193.0.0.0");
            expect(component.results.length).toEqual(4);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it("should handle empty flags", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: " 193.0.0.0 ",
                types: "",
                inverse: undefined,
                hierarchyFlag: undefined,
                bflag: "",
                rflag: "",
                dflag: "",
                source: "GRS",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual("193.0.0.0");
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual("GRS");
            expect(component.whoisCliQuery().trim()).toEqual("--resource 193.0.0.0");
            expect(component.results.length).toEqual(4);
            component.lastResultOnScreen();
            expect(component.offset).toEqual(0);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });
    });

    describe("during scrolling", () => {

        const successResponse = {
            objects: {
                object: [ whoisObjectModelMock ]
            }
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(of(successResponse));
            queryServiceSpy.PAGE_SIZE = 20 as any;
        });

        it("should react to scroll events (async)", async() => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: " 193.0.0.0 ",
                types: "inetnum;inet6num",
                inverse: undefined,
                hierarchyFlag: undefined,
                bflag: "",
                rflag: "false",
                dflag: "true",
                source: "TEST",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            await fixture.whenStable();
            component.offset = 0;
            expect(component.results.length).toEqual(1);
            component.showScroller = true;
            component.lastResultOnScreen();
            expect(component.offset).toEqual(20);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(2);
        });

        it("should react to scroll events", async() => {
            component.init();
            fixture.detectChanges();
            await fixture.whenStable();
            component.updateClicked(whoisObjectModelMock);
            expect(component.router.navigate).toHaveBeenCalledWith(["webupdates/modify", "ripe", "inetnum", "88.208.87.32 - 88.208.87.39"]);
        });
    });

    describe("with a failed query", () => {

        const errorResponse = {
            errormessages: {
                errormessage: [
                    {
                        severity: "Error",
                        text: "%s,\nand thanks for all the %s",
                        args: [
                            {value: "Goodbye"},
                            {value: "fish"}
                        ]
                    },
                    {
                        severity: "Error",
                        text: "So %s, %s Road",
                        args: [
                            {value: "Goodbye"},
                            {value: "Yellow Brick"}
                        ]
                    },
                    {
                        severity: "Error",
                        text: "%s%s",
                        args: [
                            {value: "Goodbye"},
                            {value: ", cruel world!"}
                        ]
                    },
                    {
                        severity: "Error",
                        text: "Broken message",
                        args: [
                            {value: "Goodbye"}
                        ]
                    }
                ]
            }
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(throwError(errorResponse));
        });

        it("should show error messages", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: " 193.0.0.0 ",
                types: "inetnum;inet6num",
                inverse: "mntner",
                hierarchyFlag: "one-less",
                rflag: "false",
                dflag: "true",
                bflag: "",
                source: "TEST",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual("193.0.0.0");
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(true);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(component.qp.inverse).toEqual({MNTNER: true});
            expect(component.qp.source).toEqual("TEST");
            expect(component.whoisCliQuery()).toEqual("-i mntner -T inetnum,inet6num -ld --sources TEST 193.0.0.0");

            expect(component.alertsService.alerts.errors.length).toEqual(4);
            expect(component.formatError(component.alertsService.alerts.errors[0])).toEqual("Goodbye,\nand thanks for all the fish");
            expect(component.formatError(component.alertsService.alerts.errors[1])).toEqual("So Goodbye, Yellow Brick Road");
            expect(component.formatError(component.alertsService.alerts.errors[2])).toEqual("Goodbye, cruel world!");
            expect(component.formatError(component.alertsService.alerts.errors[3])).toEqual("Broken message");
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });
    });

    describe("with a --template query", () => {

        it("should not show error or warning messages", () => {
            queryServiceSpy.searchTemplate.and.returnValue(of(mockTemplateAutnum));
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: " 193.0.0.0 -t aut-num",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.whoisCliQuery()).toEqual("-t aut-num");
            component.doSearch();
            expect(component.alertsService.alerts.errors.length).toEqual(0);
        });

        it("should show error messages", () => {
            queryServiceSpy.searchTemplate.and.returnValue(of(mockTemplateAutnum));
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                searchtext: "blah blah --template zzz inetnum",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])
            })};
            component.init();
            // fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.source).toEqual("RIPE");
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.whoisCliQuery()).toEqual(" ");
            component.doSearch();
            expect(component.alertsService.alerts.errors.length).toEqual(1);
            expect(component.formatError(component.alertsService.alerts.errors[0])).toEqual("Unknown object type \"zzz\".");
        });
    });
});
