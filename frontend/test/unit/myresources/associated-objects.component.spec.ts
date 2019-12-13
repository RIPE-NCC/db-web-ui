import {ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {AssociatedObjectsComponent} from "../../../src/app/myresources/associatedobjects/associated-objects.component";
import {
    AssociatedObjectsService, IAssociatedDomainObject,
    IAssociatedRouteObject
} from "../../../src/app/myresources/associatedobjects/associated-objects.service";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {PropertiesService} from "../../../src/app/properties.service";

describe("AssociatedObjectsComponent", () => {
    let component: AssociatedObjectsComponent;
    let fixture: ComponentFixture<AssociatedObjectsComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                RouterTestingModule,
                HttpClientTestingModule
            ],
            declarations: [
                AssociatedObjectsComponent,
            ],
            providers: [
                AssociatedObjectsService,
                PropertiesService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(AssociatedObjectsComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe("for route", () => {

        it("should instantiate route tables", async () => {
            component.associatedType = "route";
            component.objectType = "inetnum";
            component.objectName = "185.162.88.0 - 185.162.91.255";
            component.ngOnChanges();
            const req = httpMock.expectOne({
                method: "GET",
                url: "api/whois-internal/api/resources/inetnum/185.162.88.0 - 185.162.91.255/associated-route-objects.json?filter=&page=0",
            });
            fixture.detectChanges();
            expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/inetnum/185.162.88.0 - 185.162.91.255/associated-route-objects.json?filter=&page=0");
            req.flush(ASSOCIATED_INETNUM_ROUTES_MOCK);
            await fixture.whenStable();
            expect(component.title).toEqual("Associated Route Objects");
            expect(component.resultObject.associatedObjects.length).toEqual(3);
            const associatedRouteObjects: IAssociatedRouteObject[] = component.resultObject.associatedObjects as IAssociatedRouteObject[];
            expect(associatedRouteObjects[0].prefix).toEqual("185.162.89.0/24");
            expect(associatedRouteObjects[0].origin).toEqual("AS8100");
            expect(associatedRouteObjects[1].prefix).toEqual("185.162.90.0/24");
            expect(associatedRouteObjects[1].origin).toEqual("AS41108");
            expect(associatedRouteObjects[2].prefix).toEqual("185.162.91.0/24");
            expect(associatedRouteObjects[2].origin).toEqual("AS41108");
        });

        it("should instantiate route tables for inet6num", async () => {
            component.associatedType = "route";
            component.objectType = "inet6num";
            component.objectName = "2001:67c:2334::/48";
            component.ngOnChanges();
            fixture.detectChanges();
            const req = httpMock.expectOne({
                method: "GET",
                url: "api/whois-internal/api/resources/inet6num/2001:67c:2334::/48/associated-route-objects.json?filter=&page=0"
            });
            expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/inet6num/2001:67c:2334::/48/associated-route-objects.json?filter=&page=0");
            req.flush(ASSOCIATED_INET6NUM_ROUTES_MOCK);
            await fixture.whenStable();
            expect(component.title).toEqual("Associated Route Objects");
        });

        it("should instantiate route tables for inet6num", async () => {
            component.associatedType = "route";
            component.objectType = "aut-num";
            component.objectName = "AS24819";
            component.ngOnChanges();
            fixture.detectChanges();
            const req = httpMock.expectOne({
                method: "GET",
                url: "api/whois-internal/api/resources/aut-num/AS24819/associated-route-objects.json?filter=&page=0"
            });
            expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/aut-num/AS24819/associated-route-objects.json?filter=&page=0");
            req.flush(ASSOCIATED_AUTNUM_ROUTES_MOCK);
            await fixture.whenStable();
            expect(component.title).toEqual("Associated Route Objects");
            expect(component.resultObject.associatedObjects.length).toEqual(2);
            const associatedRouteObjects: IAssociatedRouteObject[] = component.resultObject.associatedObjects as IAssociatedRouteObject[];
            expect(associatedRouteObjects[0].prefix).toEqual("91.216.7.0/24");
            expect(associatedRouteObjects[0].origin).toEqual("AS24819");
            expect(associatedRouteObjects[1].prefix).toEqual("193.111.104.0/22");
            expect(associatedRouteObjects[1].origin).toEqual("AS24819");
        });
    });

    describe("for domain", () => {

        it("should instantiate domain tables", async () => {
            component.associatedType = "domain";
            component.objectType = "inetnum";
            component.objectName = "185.162.88.0 - 185.162.91.255";
            component.ngOnChanges();
            fixture.detectChanges();
            const req = httpMock.expectOne({
                method: "GET",
                url: "api/whois-internal/api/resources/inetnum/185.162.88.0 - 185.162.91.255/associated-domain-objects.json?filter=&page=0"
            });
            expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/inetnum/185.162.88.0 - 185.162.91.255/associated-domain-objects.json?filter=&page=0");
            req.flush(ASSOCIATED_INETNUM_DOMAIN_MOCK);
            await fixture.whenStable();
            expect(component.title).toEqual("Associated Domain Objects");
            expect(component.resultObject.associatedObjects.length).toEqual(3);
            const associatedDomainObjects: IAssociatedDomainObject[] = component.resultObject.associatedObjects as IAssociatedDomainObject[];
            expect(associatedDomainObjects[0].domain).toEqual("89.162.185.in-addr.arpa");
            expect(associatedDomainObjects[1].domain).toEqual("90.162.185.in-addr.arpa");
            expect(associatedDomainObjects[2].domain).toEqual("91.162.185.in-addr.arpa");
        });

        it("should not instantiate domain tables for aut-num", async () => {
            component.associatedType = "domain";
            component.objectType = "aut-num";
            component.objectName = "AS24819";
            component.ngOnChanges();
            fixture.detectChanges();
            httpMock.expectNone({
                method: "GET",
                url: "api/whois-internal/api/resources/aut-num/AS24819/associated-domain-objects.json?filter=&page=0"
            });
            await fixture.whenStable();
            expect(component.resource).toBeUndefined();
        });
    });

});

const ASSOCIATED_INETNUM_ROUTES_MOCK = {
    "associatedObjects": [
        {
            "type": "associated-route",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "origin": "AS8100",
            "prefix": "185.162.89.0/24",
        },
        {
            "type": "associated-route",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "origin": "AS41108",
            "prefix": "185.162.90.0/24",
        },
        {
            "type": "associated-route",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "origin": "AS41108",
            "prefix": "185.162.91.0/24",
        }
    ],
    "totalNumberOfResources": 3,
    "filteredSize": 3,
    "pageSize": 3
};
const ASSOCIATED_INET6NUM_ROUTES_MOCK = {};
const ASSOCIATED_AUTNUM_ROUTES_MOCK = {
        "associatedObjects": [
            {
                "type": "associated-route",
                "associatedResource": "AS24819",
                "relatedResourceType": "aut-num",
                "origin": "AS24819",
                "prefix": "91.216.7.0/24"
            },
            {
                "type": "associated-route",
                "associatedResource": "AS24819",
                "relatedResourceType": "aut-num",
                "origin": "AS24819",
                "prefix": "193.111.104.0/22"
            }
        ],
        "totalNumberOfResources": 2,
        "filteredSize": 2,
        "pageSize": 2
    };
const ASSOCIATED_INETNUM_DOMAIN_MOCK = {
    "associatedObjects": [
        {
            "type": "associated-domain",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "domain": "89.162.185.in-addr.arpa"
        },
        {
            "type": "associated-domain",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "domain": "90.162.185.in-addr.arpa"
        },
        {
            "type": "associated-domain",
            "associatedResource": "185.162.88.0 - 185.162.91.255",
            "relatedResourceType": "inetnum",
            "domain": "91.162.185.in-addr.arpa"
        }
    ],
    "totalNumberOfResources": 3,
    "filteredSize": 3,
    "pageSize": 3
};
