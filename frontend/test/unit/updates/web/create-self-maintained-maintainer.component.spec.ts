import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {of} from "rxjs";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {CookieService} from "ngx-cookie-service";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CoreModule} from "../../../../src/app/core/core.module";
import {PropertiesService} from "../../../../src/app/properties.service";
import {RestService} from "../../../../src/app/updatesweb/rest.service";
import {MessageStoreService} from "../../../../src/app/updatesweb/message-store.service";
import {ErrorReporterService} from "../../../../src/app/updatesweb/error-reporter.service";
import {LinkService} from "../../../../src/app/updatesweb/link.service";
import {UserInfoService} from "../../../../src/app/userinfo/user-info.service";
import {CreateSelfMaintainedMaintainerComponent} from "../../../../src/app/updatesweb/create-self-maintained-maintainer.component";

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
                NgOptionHighlightModule,
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
        httpMock = TestBed.inject(HttpTestingController);
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

    it("should load the maintainer attributes", () => {
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "upd-to").value).toEqual("tdacruzper@ripe.net");
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "auth").value).toEqual("SSO tdacruzper@ripe.net");
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "source").value).toEqual("RIPE");
    });

    it("should add admin-c to the maintainer attributes", () => {
        component.onAdminCAdded({key: "some-admin-c"});

        component.maintainerAttributes = component.whoisResourcesService.removeNullAttributes(component.maintainerAttributes);
        component.maintainerAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "admin-c").value).toEqual("some-admin-c");
    });

    it("should remove admin-c from the maintainer attributes", () => {
        component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "admin-c").value = "first-admin";
        component.maintainerAttributes = component.whoisResourcesService.addAttributeAfterType(component.maintainerAttributes,
            {name: "admin-c",
            value: "some-admin-c"
        }, {name: "admin-c"});

        component.onAdminCRemoved({key: "first-admin"});

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.maintainerAttributes, "admin-c").value).toEqual("some-admin-c");
    });

    it("should set default upd-to info for the self maintained maintainer when submitting", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        const validatedAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        const updTo = component.whoisResourcesService.getSingleAttributeOnName(validatedAttributes, "upd-to");

        component.submit();

        expect(updTo.value).toEqual("tdacruzper@ripe.net");

        component.submit();
        fixture.detectChanges();
        expect(restServiceMock.createObject).toHaveBeenCalled();
    });

    it("should set default auth info for the self maintained maintainer when submitting", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        const validateAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        const updTo = component.whoisResourcesService.getSingleAttributeOnName(validateAttributes, "auth");

        component.submit();

        expect(updTo.value).toEqual("SSO tdacruzper@ripe.net");
    });

    it("should set mntner value to mnt-by for the self maintained maintainer when submitting", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();
        let mntAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        component.whoisResourcesService.setSingleAttributeOnName(mntAttributes, "mntner", "SOME-MNT");
        mntAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        const mntBy = component.whoisResourcesService.getSingleAttributeOnName(mntAttributes, "mnt-by");

        component.submit();

        expect(mntBy.value).toEqual("SOME-MNT");
    });

    it("should set source from the params when submitting", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();
        const validateAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        const updTo = component.whoisResourcesService.getSingleAttributeOnName(validateAttributes, "source");

        component.submit();

        expect(updTo.value).toEqual(SOURCE);
    });

    it("should create the maintainer", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}, getPrimaryKey: () => ""}));
        fillForm();

        component.submit();

        const obj = component.whoisResourcesService.turnAttrsIntoWhoisObject(component.maintainerAttributes);
        expect(restServiceMock.createObject.calls.argsFor(0)[0]).toEqual(SOURCE);
        expect(restServiceMock.createObject.calls.argsFor(0)[1]).toEqual("mntner");
        expect(restServiceMock.createObject.calls.argsFor(0)[2]).toEqual(obj);
    });

    it("should redirect to display page after creating a maintainer", () => {
        spyOn(component.messageStoreService, "add");
        const whoisResources = component.whoisResourcesService.validateWhoisResources(CREATE_RESPONSE);
        restServiceMock.createObject.and.returnValue(of(whoisResources));

        fillForm();

        component.submit();

        expect(component.messageStoreService.add).toHaveBeenCalledWith("test-mnt", whoisResources);
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/${SOURCE}/mntner/test-mnt?method=Create`);
    });

    it("should not post if invalid attributes", () => {
        component.maintainerAttributes = component.whoisResourcesService.validateAttributes(
            component.whoisMetaService.enrichAttributesWithMetaInfo("mntner",
                component.whoisMetaService.getMandatoryAttributesOnObjectType("mntner")
            )
        );
        component.submit();
    });

    // it("should display error if create the maintainer fails", () => {
    //     spyOn(component.alertsComponent, "populateFieldSpecificErrors");
    //     spyOn(component.alertsComponent, "setErrors");
    //     fillForm();
    //     restServiceMock.createObject.and.returnValue(throwError(ERROR_RESPONSE));
    //
    //     component.submit();
    //
    //     expect(component.alertsComponent.populateFieldSpecificErrors).toHaveBeenCalledWith("mntner", component.maintainerAttributes, ERROR_RESPONSE.data);
    //     expect(component.alertsComponent.setErrors).toHaveBeenCalledWith(ERROR_RESPONSE.data);
    // });

    function fillForm() {
        let wrapAttributes = component.whoisResourcesService.validateAttributes(component.maintainerAttributes);
        component.whoisResourcesService.setSingleAttributeOnName(wrapAttributes, "mntner", "SOME-MNT");
        component.whoisResourcesService.setSingleAttributeOnName(wrapAttributes, "descr", "uhuuuuuu");
        component.whoisResourcesService.setSingleAttributeOnName(wrapAttributes, "admin-c", "SOME-ADM");
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
