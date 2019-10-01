import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {SharedModule} from "../../../../app/ng/shared/shared.module";
import {CoreModule} from "../../../../app/ng/core/core.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {PropertiesService} from "../../../../app/ng/properties.service";
import {RestService} from "../../../../app/ng/updates/rest.service";
import {MessageStoreService} from "../../../../app/ng/updates/message-store.service";
import {ErrorReporterService} from "../../../../app/ng/updates/error-reporter.service";
import {LinkService} from "../../../../app/ng/updates/link.service";
import {CookieService} from "ngx-cookie-service";
import {UserInfoService} from "../../../../app/ng/userinfo/user-info.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CreateSelfMaintainedMaintainerComponent} from "../../../../app/ng/updates/web/create-self-maintained-maintainer.component";
import {of, throwError} from "rxjs";
import {Location} from "@angular/common";

describe("CreateSelfMaintainedMaintainerComponent", () => {

    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateSelfMaintainedMaintainerComponent>;
    let component: CreateSelfMaintainedMaintainerComponent;
    let routerMock: any;
    let restServiceMock: any;
    const SOURCE = "RIPE";

    beforeEach(async () => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        restServiceMock = jasmine.createSpyObj("RestService", ["createObject"]);
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                NgSelectModule,
                HttpClientTestingModule],
            declarations: [CreateSelfMaintainedMaintainerComponent],
            providers: [
                PropertiesService,
                MessageStoreService,
                ErrorReporterService,
                { provide: Location, useValue: {path: () => ("")}},
                LinkService,
                CookieService,
                UserInfoService,
                { provide: RestService, useValue: restServiceMock},
                { provide: ActivatedRoute, useValue: {snapshot: {
                    paramMap: {
                    source: SOURCE,
                        get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                        has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])},
                    queryParamMap: {
                        has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])}}}},
                { provide: Router, useValue: routerMock},
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(CreateSelfMaintainedMaintainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"})
            .flush(USER_INFO_DATA_DUMMY);
        await fixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should load the maintainer attributes", async () => {
        await fixture.whenStable();
        expect(component.maintainerAttributes.getSingleAttributeOnName("upd-to").value).toEqual("tdacruzper@ripe.net");
        expect(component.maintainerAttributes.getSingleAttributeOnName("auth").value).toEqual("SSO tdacruzper@ripe.net");
        expect(component.maintainerAttributes.getSingleAttributeOnName("source").value).toEqual("RIPE");
    });

    it("should add admin-c to the maintainer attributes", async () => {
        await fixture.whenStable();
        component.onAdminCAdded({key: "some-admin-c"});

        component.maintainerAttributes = component.maintainerAttributes.removeNullAttributes();
        component.maintainerAttributes = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes);

        expect(component.maintainerAttributes.getSingleAttributeOnName("admin-c").value).toEqual("some-admin-c");
    });

    it("should remove admin-c from the maintainer attributes", () => {
        component.maintainerAttributes.getSingleAttributeOnName("admin-c").value = "first-admin";
        component.maintainerAttributes = component.maintainerAttributes.addAttributeAfterType({
            name: "admin-c",
            value: "some-admin-c"
        }, {name: "admin-c"});

        component.onAdminCRemoved({key: "first-admin"});
        component.maintainerAttributes = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes);

        expect(component.maintainerAttributes.getSingleAttributeOnName("admin-c").value).toEqual("some-admin-c");
    });

    it("should set default upd-to info for the self maintained maintainer when submitting", async () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        const updTo = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes).getSingleAttributeOnName("upd-to");

        component.submit();
        await fixture.whenStable();

        expect(updTo.value).toEqual("tdacruzper@ripe.net");

        component.submit();
        fixture.detectChanges();
        expect(restServiceMock.createObject).toHaveBeenCalled();
    });

    it("should set default auth info for the self maintained maintainer when submitting", async () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        const updTo = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes).getSingleAttributeOnName("auth");

        component.submit();
        await fixture.whenStable();

        expect(updTo.value).toEqual("SSO tdacruzper@ripe.net");
    });

    it("should set mntner value to mnt-by for the self maintained maintainer when submitting", async () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        component.whoisResourcesService.wrapAttributes(component.maintainerAttributes).setSingleAttributeOnName("mntner", "SOME-MNT");
        const mntBy = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes).getSingleAttributeOnName("mnt-by");

        component.submit();
        await fixture.whenStable();

        expect(mntBy.value).toEqual("SOME-MNT");
    });

    it("should set source from the params when submitting", async () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        const updTo = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes).getSingleAttributeOnName("source");

        component.submit();
        await fixture.whenStable();

        expect(updTo.value).toEqual(SOURCE);
    });

    it("should create the maintainer", async () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        component.submit();
        await fixture.whenStable();

        const obj = component.whoisResourcesService.turnAttrsIntoWhoisObject(component.maintainerAttributes);
        expect(restServiceMock.createObject.calls.argsFor(0)[0]).toEqual(SOURCE);
        expect(restServiceMock.createObject.calls.argsFor(0)[1]).toEqual("mntner");
        expect(restServiceMock.createObject.calls.argsFor(0)[2]).toEqual(obj);
    });

    it("should redirect to display page after creating a maintainer", async () => {
        spyOn(component.messageStoreService, "add");
        const whoisResources = component.whoisResourcesService.wrapWhoisResources(CREATE_RESPONSE);
        restServiceMock.createObject.and.returnValue(of(whoisResources));

        fillForm();

        component.submit();
        await fixture.whenStable();

        expect(component.messageStoreService.add).toHaveBeenCalledWith("test-mnt", whoisResources);
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/${SOURCE}/mntner/test-mnt`);
    });

    it("should not post if invalid attributes", () => {
        component.maintainerAttributes = component.whoisResourcesService.wrapAttributes(
            component.whoisMetaService.enrichAttributesWithMetaInfo("mntner",
                component.whoisMetaService.getMandatoryAttributesOnObjectType("mntner")
            )
        );
        component.submit();
    });

    it("should display error if create the maintainer fails", async () => {
        spyOn(component.alertService, "populateFieldSpecificErrors");
        spyOn(component.alertService, "showWhoisResourceErrors");
        fillForm();
        restServiceMock.createObject.and.returnValue(throwError(ERROR_RESPONSE));

        component.submit();
        await fixture.whenStable();

        expect(component.alertService.populateFieldSpecificErrors).toHaveBeenCalledWith("mntner", component.maintainerAttributes, ERROR_RESPONSE.data);
        expect(component.alertService.showWhoisResourceErrors).toHaveBeenCalledWith("mntner", ERROR_RESPONSE.data);
    });

    function fillForm() {
        let wrapAttributes = component.whoisResourcesService.wrapAttributes(component.maintainerAttributes);
        wrapAttributes.setSingleAttributeOnName("mntner", "SOME-MNT");
        wrapAttributes.setSingleAttributeOnName("descr", "uhuuuuuu");
        wrapAttributes.setSingleAttributeOnName("admin-c", "SOME-ADM");
    }
});

const USER_INFO_DATA_DUMMY = {
    user: {
        "username": "tdacruzper@ripe.net",
        "displayName": "Test User",
        "expiryDate": "[2015,7,7,14,58,3,244]",
        "uuid": "aaaa-bbbb-cccc-dddd",
        "active": "true"
    }
};

const CREATE_RESPONSE = {
    "link": {
        "type": "locator",
        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner"
    },
    "objects": {
        "object": [{
            "type": "mntner",
            "link": {
                "type": "locator",
                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt"
            },
            "source": {
                "id": "ripe"
            },
            "primary-key": {
                "attribute": [{
                    "name": "mntner",
                    "value": "test-mnt"
                }]
            },
            "attributes": {
                "attribute": [{
                    "name": "mntner",
                    "value": "jsdhgkjsd-mnt"
                }, {
                    "name": "descr",
                    "value": "jjjj"
                }, {
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/person/DW-RIPE"
                    },
                    "name": "admin-c",
                    "value": "DW-RIPE",
                    "referenced-type": "person"
                }, {
                    "name": "upd-to",
                    "value": "tdacruzper@ripe.net"
                }, {
                    "name": "auth",
                    "value": "SSO tdacruzper@ripe.net"
                }, {
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt"
                    },
                    "name": "mnt-by",
                    "value": "jsdhgkjsd-mnt",
                    "referenced-type": "mntner"
                }, {
                    "name": "created",
                    "value": "2015-08-12T11:56:29Z"
                }, {
                    "name": "last-modified",
                    "value": "2015-08-12T11:56:29Z"
                }, {
                    "name": "source",
                    "value": "RIPE"
                }]
            }
        }]
    },
    "terms-and-conditions": {
        "type": "locator",
        "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
    }
};

const ERROR_RESPONSE = {
    data: {
        "link": {
            "type": "locator",
            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner"
        },
        "objects": {
            "object": [{
                "type": "mntner",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/sdfsdf"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "mntner",
                        "value": "sdfsdf"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "mntner",
                        "value": "sdfsdf"
                    }, {
                        "name": "descr",
                        "value": "sdfsdf"
                    }, {
                        "name": "admin-c",
                        "value": "sdfds-ripe"
                    }, {
                        "name": "upd-to",
                        "value": "tdacruzper@ripe.net"
                    }, {
                        "name": "auth",
                        "value": "SSO tdacruzper@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/sdfsdf"
                        },
                        "name": "mnt-by",
                        "value": "sdfsdf",
                        "referenced-type": "mntner"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                }
            }]
        },
        "errormessages": {
            "errormessage": [{
                "severity": "Error",
                "attribute": {
                    "name": "admin-c",
                    "value": "sdfds-ripe"
                },
                "text": "Syntax error in %s",
                "args": [{
                    "value": "sdfds-ripe"
                }]
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    }
};
