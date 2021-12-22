import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CookieService} from "ngx-cookie-service";
import {of} from "rxjs";
import {WhoisMetaService} from "../../../../src/app/shared/whois-meta.service";
import {SelectComponent} from "../../../../src/app/updatesweb/select.component";
import {UserInfoService} from "../../../../src/app/userinfo/user-info.service";
import {PropertiesService} from "../../../../src/app/properties.service";

describe("SelectController", () => {

    afterAll( () => {
        TestBed.resetTestingModule();
    })

    const OBJECT_TYPE = "as-set";
    const SOURCE = "RIPE";

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<SelectComponent>;
    let component: SelectComponent;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let preferencesServiceMock: any;
    let routerMock: any;
    let modalMock: any;
    let refs: string[] = [];

    const whoisMetaServiceMock = {
                objectTypesMap: {
                    "inetnum": {
                        attributes: [
                            {name: "inetnum", mandatory: true, multiple: false, primaryKey: true, refs: refs},
                            {name: "netname", mandatory: true, multiple: false, refs: refs},
                            {name: "descr", mandatory: false, multiple: true, refs: refs},
                            {name: "country", mandatory: true, multiple: true, refs: refs, isEnum: true},
                            {name: "geofeed", mandatory: false, multiple: false, refs: refs},
                            {name: "geoloc", mandatory: false, multiple: false, refs: refs},
                            {name: "language", mandatory: false, multiple: true, refs: refs, isEnum: true},
                            {name: "org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "sponsoring-org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "admin-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "tech-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "abuse-c", mandatory: false, multiple: false, refs: ["ROLE"]},
                            {name: "status", mandatory: true, multiple: false, refs: refs, isEnum: true},
                            {name: "remarks", mandatory: false, multiple: true, refs: refs},
                            {name: "notify", mandatory: false, multiple: true, refs: refs},
                            {name: "mnt-by", mandatory: true, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-lower", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-domains", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-routes", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-irt", mandatory: false, multiple: true, refs: ["IRT"]},
                            {name: "created", mandatory: false, multiple: false, refs: refs},
                            {name: "last-modified", mandatory: false, multiple: false, refs: refs},
                            {name: "source", mandatory: true, multiple: false, refs: refs},
                        ],
                        // description: undefined,
                        name: "inetnum"
                    },
                    "inet6num": {
                        attributes: [
                            {name: "inet6num", mandatory: true, multiple: false, primaryKey: true, refs: refs},
                            {name: "netname", mandatory: true, multiple: false, refs: refs},
                            {name: "descr", mandatory: false, multiple: true, refs: refs},
                            {name: "country", mandatory: true, multiple: true, refs: refs, isEnum: true},
                            {name: "geofeed", mandatory: false, multiple: false, refs: refs},
                            {name: "geoloc", mandatory: false, multiple: false, refs: refs},
                            {name: "language", mandatory: false, multiple: true, refs: refs, isEnum: true},
                            {name: "org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "sponsoring-org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "admin-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "tech-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "abuse-c", mandatory: false, multiple: false, refs: ["ROLE"]},
                            {name: "status", mandatory: true, multiple: false, refs: refs, isEnum: true},
                            {name: "assignment-size", mandatory: false, multiple: false, refs: refs},
                            {name: "remarks", mandatory: false, multiple: true, refs: refs},
                            {name: "notify", mandatory: false, multiple: true, refs: refs},
                            {name: "mnt-by", mandatory: true, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-lower", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-routes", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-domains", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-irt", mandatory: false, multiple: true, refs: ["IRT"]},
                            {name: "created", mandatory: false, multiple: false, refs: refs},
                            {name: "last-modified", mandatory: false, multiple: false, refs: refs},
                            {name: "source", mandatory: true, multiple: false, refs: refs},
                        ],
                        // description: undefined,
                        name: "inet6num"
                    },
                    "domain": {
                        attributes: [
                            {name: "domain", mandatory: true, multiple: false, primaryKey: true, refs: refs},
                            {name: "descr", mandatory: false, multiple: true, refs: refs},
                            {name: "org", mandatory: false, multiple: true, refs: ["ORGANISATION"]},
                            {name: "admin-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "tech-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "zone-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "nserver", mandatory: true, multiple: true, refs: refs},
                            {name: "ds-rdata", mandatory: false, multiple: true, refs: refs},
                            {name: "remarks", mandatory: false, multiple: true, refs: refs},
                            {name: "notify", mandatory: false, multiple: true, refs: refs},
                            {name: "mnt-by", mandatory: true, multiple: true, refs: ["MNTNER"]},
                            {name: "created", mandatory: false, multiple: false, refs: refs},
                            {name: "last-modified", mandatory: false, multiple: false, refs: refs},
                            {name: "source", mandatory: true, multiple: false, refs: refs},
                        ],
                        // description: undefined,
                        name: "domain"
                    },
                    "aut-num": {
                        attributes: [
                            {name: "aut-num", mandatory: true, multiple: false, primaryKey: true, refs: refs},
                            {name: "as-name", mandatory: true, multiple: false, refs: refs, searchable: true},
                            {name: "descr", mandatory: false, multiple: true, refs: refs, searchable: true},
                            {name: "member-of", mandatory: false, multiple: true, refs: ["AS-SET", "ROUTE-SET", "RTR-SET"]},
                            {name: "import-via", mandatory: false, multiple: true, refs: refs},
                            {name: "import", mandatory: false, multiple: true, refs: refs},
                            {name: "mp-import", mandatory: false, multiple: true, refs: refs},
                            {name: "export-via", mandatory: false, multiple: true, refs: refs},
                            {name: "export", mandatory: false, multiple: true, refs: refs},
                            {name: "mp-export", mandatory: false, multiple: true, refs: refs},
                            {name: "default", mandatory: false, multiple: true, refs: refs},
                            {name: "mp-default", mandatory: false, multiple: true, refs: refs},
                            {name: "remarks", mandatory: false, multiple: true, refs: refs},
                            {name: "org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "sponsoring-org", mandatory: false, multiple: false, refs: ["ORGANISATION"]},
                            {name: "admin-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "tech-c", mandatory: true, multiple: true, refs: ["PERSON", "ROLE"]},
                            {name: "abuse-c", mandatory: false, multiple: false, refs: ["ROLE"]},
                            {name: "status", mandatory: false, multiple: false, refs: refs, isEnum: true},
                            {name: "notify", mandatory: false, multiple: true, refs: refs},
                            {name: "mnt-lower", mandatory: false, multiple: true, refs: ["MNTNER"]},
                            {name: "mnt-by", mandatory: true, multiple: true, refs: ["MNTNER"]},
                            {name: "created", mandatory: false, multiple: false, refs: refs},
                            {name: "last-modified", mandatory: false, multiple: false, refs: refs},
                            {name: "source", mandatory: true, multiple: false, refs: refs},
                        ],
                        // description: undefined,
                        name: "aut-num"
                    }
                },
                getObjectTypes: () => {
                    let keys: string[] = [];
                    for (let key in whoisMetaServiceMock.objectTypesMap) {
                        keys.push(key);
                    }
                    return keys;
                }
            };

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj("PreferenceService", ["isTextMode", "setTextMode", "isWebMode", "setWebMode"]);
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [SelectComponent],
            providers: [
                {provide: WhoisMetaService, useValue: whoisMetaServiceMock},
                UserInfoService,
                CookieService,
                PropertiesService,
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
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(SelectComponent);
        component = componentFixture.componentInstance;
    });

    afterEach(() => {
       httpMock.verify();
    });

    it("should navigate to crowd if currently logged out", () => {
        componentFixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush("", {statusText: "error", status: 401});
        expect(component.loggedIn).toBeUndefined();

        component.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        component.navigateToCreate();

        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/create", component.selected.source, component.selected.objectType]);
        // Note that the  error-interceptor is responsible for flagging redirect to crowd
    });


    it("should navigate to create screen when logged in", () => {
        componentFixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush({ user: {
                username:"test@ripe.net",
                displayName:"Test User",
                uuid:"aaaa-bbbb-cccc-dddd",
                active:true}
            });
        expect(component.loggedIn).toBeTruthy();

        component.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        component.navigateToCreate();

        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/create", component.selected.source, component.selected.objectType]);
    });

    it("should navigate to create person maintainer screen when logged in and selected", () => {
        componentFixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush({ user: {
                username:"test@ripe.net",
                displayName:"Test User",
                uuid:"aaaa-bbbb-cccc-dddd",
                active:true}
        });

        expect(component.loggedIn).toBeTruthy();

        // role-mntnr pair is default selection (top of the drop down list)
        component.navigateToCreate();
        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/create", component.selected.source, "role", "self"]);
    });

    it("should navigate to create self maintained mntner screen when logged in", () => {
        componentFixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush({
                user: {
                    username: "test@ripe.net",
                    displayName: "Test User",
                    uuid: "aaaa-bbbb-cccc-dddd",
                    active: true
                }
            }
        );

        expect(component.loggedIn).toBeTruthy();

        component.selected = {
            source: SOURCE,
            objectType: "mntner"
        };

        component.navigateToCreate();

        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/create", component.selected.source, "mntner", "self"]);
        expect(component.selected.source).toBe(SOURCE);
    });

});
