import {ComponentFixture, TestBed} from "@angular/core/testing";
import {convertToParamMap} from "@angular/router";
import {of, throwError} from "rxjs";
import {RouterTestingModule} from "@angular/router/testing";
import {CookieService} from "ngx-cookie-service";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {LookupSingleObjectComponent} from "../../../src/app/query/lookup-single-object.component";
import {LookupComponent} from "../../../src/app/query/lookup.component";
import {WhoisObjectViewerComponent} from "../../../src/app/whois-object/whois-object-viewer.component";
import {LookupService} from "../../../src/app/query/lookup.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {PropertiesService} from "../../../src/app/properties.service";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";

describe("LookupSingleObjectComponent", () => {

    let component: LookupSingleObjectComponent;
    let fixture: ComponentFixture<LookupSingleObjectComponent>;
    let lookupServiceSpy: jasmine.SpyObj<LookupService>;

    beforeEach(() => {
        lookupServiceSpy = jasmine.createSpyObj("LookupService", ["lookupWhoisObject"]);
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            declarations: [
                LookupSingleObjectComponent,
                LookupComponent,
                WhoisObjectViewerComponent
            ],
            providers: [
                PropertiesService,
                UserInfoService,
                CookieService,
                { provide: LookupService, useValue: lookupServiceSpy},
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LookupSingleObjectComponent);
        component = fixture.componentInstance;
        spyOn(component.router, "navigate");
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("should shows an object", () => {

        it("all lovely and that", async() => {
            lookupServiceSpy.lookupWhoisObject.and.returnValue(of(mockResponse.singleResult));
            component.activatedRoute.queryParams = of({
                source: "useTheSource",
                type: "thetype",
                key: "thekey",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (hash: string) => true
            });
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.whoisResponse).toBeTruthy();
            component.goToUpdate();
            expect(component.router.navigate).toHaveBeenCalledWith(["webupdates/modify", "useTheSource", "thetype", "thekey"]);
        });

        it("but not when the params are empty", async() => {
            lookupServiceSpy.lookupWhoisObject.and.returnValue(throwError("That just won't do."));
            component.activatedRoute.queryParams = of({
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (hash: string) => true
            });
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.whoisResponse).toBeFalsy();
        });

        it("but not when the response is empty", async() => {
            lookupServiceSpy.lookupWhoisObject.and.returnValue(of(mockResponse));
            component.activatedRoute.queryParams = of({
                source: "useTheSource",
                type: "thetype",
                key: "thekey",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (hash: string) => true
            });
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.whoisResponse).toBeFalsy();
        });

        it("but not when there is more than one result", async() => {
            //@ts-ignore
            lookupServiceSpy.lookupWhoisObject.and.returnValue(of(mockResponse.wakefield));
            // @ts-ignore
            component.activatedRoute.snapshot = { queryParamMap: convertToParamMap({
                source: "useTheSource",
                type: "thetype",
                key: "thekey",
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (hash: string) => true
            })};
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.whoisResponse).toBeFalsy();
        });

        it("with RIPE source even if specifed is NONAUTH, because object actualy exist in RIPE source", async() => {
            lookupServiceSpy.lookupWhoisObject.and.returnValue(throwError(mockErrorNonauth));
            component.activatedRoute.queryParams = of({
                get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
                has: (hash: string) => true
            });
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.whoisResponse).toBeFalsy();
            // this will reload page with source=RIPE because with NONAUTH object didn't exist
            expect(component.router.navigate).toHaveBeenCalledWith(["lookup"],
                {queryParams: {source: component.properties.SOURCE, type: component.objectType, key: component.objectName}});
        });
    });

    const mockResponse = {
        yorkshire: {
            "service": {
                "name": "search"
            },
            "parameters": {
                "inverse-lookup": {},
                "type-filters": {},
                "flags": {
                    "flag": [{
                        "value": "no-referenced"
                    }, {
                        "value": "no-filtering"
                    }]
                },
                "query-strings": {
                    "query-string": [{
                        "value": "yorkshire"
                    }]
                },
                "sources": {}
            },
            "objects": {
                "object": [{
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.32.80 - 82.109.32.87"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.32.80 - 82.109.32.87"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.32.80 - 82.109.32.87"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire Post Newspapers"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Leeds"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/IT417-RIPE"
                            },
                            "name": "admin-c",
                            "value": "IT417-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2004-05-26T15:24:07Z"
                        }, {
                            "name": "last-modified",
                            "value": "2004-05-26T15:24:07Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.38.224 - 82.109.38.239"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.38.224 - 82.109.38.239"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.38.224 - 82.109.38.239"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire Cottage Bakeries"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Bradford"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB4917-RIPE"
                            },
                            "name": "admin-c",
                            "value": "SB4917-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2005-04-05T14:05:08Z"
                        }, {
                            "name": "last-modified",
                            "value": "2005-04-05T14:05:08Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.38.240 - 82.109.38.255"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.38.240 - 82.109.38.255"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "82.109.38.240 - 82.109.38.255"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire Cottage Bakeries"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Bradford"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB4918-RIPE"
                            },
                            "name": "admin-c",
                            "value": "SB4918-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2005-04-05T17:25:14Z"
                        }, {
                            "name": "last-modified",
                            "value": "2005-04-05T17:25:14Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.32 - 217.204.53.47"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.32 - 217.204.53.47"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.32 - 217.204.53.47"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire and Humberland Regional Forum"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Leeds"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/PN643-RIPE"
                            },
                            "name": "admin-c",
                            "value": "PN643-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2002-12-12T10:45:01Z"
                        }, {
                            "name": "last-modified",
                            "value": "2002-12-12T10:45:01Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.224 - 217.204.53.231"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.224 - 217.204.53.231"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.224 - 217.204.53.231"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire Post Newspapers Ltd"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Leeds"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/DM1766-RIPE"
                            },
                            "name": "admin-c",
                            "value": "DM1766-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2003-03-07T13:33:14Z"
                        }, {
                            "name": "last-modified",
                            "value": "2003-03-07T13:33:14Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.232 - 217.204.53.239"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.232 - 217.204.53.239"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "217.204.53.232 - 217.204.53.239"
                        }, {
                            "name": "netname",
                            "value": "YORKSHIRE"
                        }, {
                            "name": "descr",
                            "value": "Yorkshire Post Newspapers"
                        }, {
                            "name": "descr",
                            "value": "Office"
                        }, {
                            "name": "descr",
                            "value": "Leeds"
                        }, {
                            "name": "country",
                            "value": "GB"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/DM1767-RIPE"
                            },
                            "name": "admin-c",
                            "value": "DM1767-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                            },
                            "name": "tech-c",
                            "value": "EH92-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ASSIGNED PA"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                            },
                            "name": "mnt-by",
                            "value": "EASYNET-UK-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2003-03-07T13:49:40Z"
                        }, {
                            "name": "last-modified",
                            "value": "2003-03-07T13:49:40Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "tags": {
                        "tag": [{
                            "id": "RIPE-USER-RESOURCE"
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-EA49-RIPE",
                        "name": "Easynet Global Services Limited"
                    },
                    "abuse-contact": {
                        "key": "AR17615-RIPE",
                        "email": "abuse@easynet.com"
                    },
                    "managed": false
                }, {
                    "type": "role",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/role/SYDC-RIPE"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "nic-hdl",
                            "value": "SYDC-RIPE"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "role",
                            "value": "South Yorkshire Datacentre Operators"
                        }, {
                            "name": "address",
                            "value": "***"
                        }, {
                            "name": "address",
                            "value": "***"
                        }, {
                            "name": "address",
                            "value": "S63 7JZ"
                        }, {
                            "name": "phone",
                            "value": "+44114......."
                        }, {
                            "name": "fax-no",
                            "value": "+44870......."
                        }, {
                            "name": "e-mail",
                            "value": "***@yorkshiredatacentres.co.uk"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-WDCL1-RIPE"
                            },
                            "name": "org",
                            "value": "ORG-WDCL1-RIPE",
                            "referenced-type": "organisation"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/JE281-RIPE"
                            },
                            "name": "admin-c",
                            "value": "JE281-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/SUMO"
                            },
                            "name": "admin-c",
                            "value": "SUMO",
                            "referenced-type": "role"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/JE281-RIPE"
                            },
                            "name": "tech-c",
                            "value": "JE281-RIPE",
                            "referenced-type": "person"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/SUMO"
                            },
                            "name": "tech-c",
                            "value": "SUMO",
                            "referenced-type": "role"
                        }, {
                            "name": "nic-hdl",
                            "value": "SYDC-RIPE"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/W2DATACENTRES-MNT"
                            },
                            "name": "mnt-by",
                            "value": "W2DATACENTRES-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/NETSUMO-MNT"
                            },
                            "name": "mnt-by",
                            "value": "NETSUMO-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "notify",
                            "value": "***@netsumo.com"
                        }, {
                            "name": "created",
                            "value": "2010-04-28T14:18:04Z"
                        }, {
                            "name": "last-modified",
                            "value": "2010-04-28T14:49:34Z"
                        }, {
                            "name": "source",
                            "value": "RIPE"
                        }]
                    },
                    "managed": false
                }]
            },
            "terms-and-conditions": {
                "type": "locator",
                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        },
        singleResult: {
            "service": {
                "name": "search"
            },
            "parameters": {
                "inverse-lookup": {},
                "type-filters": {
                    "type-filter": [{
                        "id": "mntner"
                    }]
                },
                "flags": {
                    "flag": [{
                        "value": "no-referenced"
                    }, {
                        "value": "no-filtering"
                    }]
                },
                "query-strings": {
                    "query-string": [{
                        "value": "etchells-mnt"
                    }]
                },
                "sources": {}
            },
            "objects": {
                "object": [{
                    "type": "mntner",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "mntner",
                            "value": "etchells-mnt"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "mntner",
                            "value": "etchells-mnt"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/PE3012-RIPE"
                            },
                            "name": "admin-c",
                            "value": "PE3012-RIPE",
                            "referenced-type": "person"
                        }, {
                            "name": "upd-to",
                            "value": "petchells@ripe.net"
                        }, {
                            "name": "auth",
                            "value": "MD5-PW",
                            "comment": "Filtered"
                        }, {
                            "name": "auth",
                            "value": "SSO",
                            "comment": "Filtered"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"
                            },
                            "name": "mnt-by",
                            "value": "etchells-mnt",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2016-03-21T16:16:47Z"
                        }, {
                            "name": "last-modified",
                            "value": "2016-09-19T14:27:00Z"
                        }, {
                            "name": "source",
                            "value": "RIPE",
                            "comment": "Filtered"
                        }]
                    },
                    "managed": false
                }]
            },
            "terms-and-conditions": {
                "type": "locator",
                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        }
    };

    const mockErrorNonauth = {
        "link": {
            "type": "locator",
            "href": "http://wagyu.prepdev.ripe.net:1080/ripe-nonauth/role/YELP1-RIPE?abuse-contact=true&managed-attributes=true&resource-holder=true&unfiltered=true"
        },
        "errormessages": {
            "errormessage": [{
                "severity": "Error",
                "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                "args": [
                    {
                        "value": "RIPE-NONAUTH"
                    }]
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    }
});

