import {ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Location} from "@angular/common";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {PropertiesService} from "../../../src/app/properties.service";
import {MoreSpecificsComponent} from "../../../src/app/myresources/morespecifics/more-specifics.component";
import {MoreSpecificsService} from "../../../src/app/myresources/morespecifics/more-specifics.service";
import {RefreshComponent} from "../../../src/app/myresources/refresh/refresh.component";

describe("MoreSpecificsComponent", () => {
    let component: MoreSpecificsComponent;
    let fixture: ComponentFixture<MoreSpecificsComponent>;
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
                MoreSpecificsComponent,
                RefreshComponent
            ],
            providers: [
                MoreSpecificsService,
                PropertiesService,
                {provide: Location, useValue: {path: () => "/myresources/detail"}},
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(MoreSpecificsComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should instantiate more specific table for inetnum", async () => {
        component.objectType = "inetnum";
        component.objectName = "62.20.0.0 - 62.20.255.255";
        component.ngOnChanges();
        fixture.detectChanges();
        const req = httpMock.expectOne({
            method: "GET",
            url: "api/whois-internal/api/resources/inetnum/62.20.0.0 - 62.20.255.255/more-specifics.json?filter=&page=0",
        });
        expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/inetnum/62.20.0.0 - 62.20.255.255/more-specifics.json?filter=&page=0");
        req.flush(MORE_SPECIFIC_INETNUM_MOCK);
        await fixture.whenStable();
        expect(component.moreSpecifics.resources.length).toEqual(8);
        expect(component.moreSpecifics.resources[0].resource).toEqual("62.20.0.0 - 62.20.0.31");
        expect(component.moreSpecifics.resources[0].status).toEqual("ASSIGNED PA");
        expect(component.moreSpecifics.resources[0].netname).toEqual("SE-SKISTAR");
        expect(component.moreSpecifics.resources[1].resource).toEqual("62.20.0.32 - 62.20.0.47");
        expect(component.moreSpecifics.resources[1].status).toEqual("ASSIGNED PA");
        expect(component.moreSpecifics.resources[1].netname).toEqual("SE-RATTVIK");
        expect(component.moreSpecifics.resources[7].resource).toEqual("62.20.0.112 - 62.20.0.119");
        expect(component.moreSpecifics.resources[7].status).toEqual("ASSIGNED PA");
        expect(component.moreSpecifics.resources[7].netname).toEqual("SE-GRSANERING");

    });

    it("should instantiate more specific table for inet6num", async () => {
        component.objectType = "inet6num";
        component.objectName = "2001:2000:1002::/48";
        component.ngOnChanges();
        fixture.detectChanges();
        const req = httpMock.expectOne({
            method: "GET",
            url: "api/whois-internal/api/resources/inet6num/2001:2000:1002::/48/more-specifics.json?filter=&page=0",
        });
        expect(req.request.urlWithParams).toBe("api/whois-internal/api/resources/inet6num/2001:2000:1002::/48/more-specifics.json?filter=&page=0");
        req.flush(MORE_SPECIFIC_INET6NUM_MOCK);
        await fixture.whenStable();
        expect(component.moreSpecifics.resources.length).toEqual(1);
        expect(component.moreSpecifics.resources[0].resource).toEqual("2001:2000:1002::/48");
        expect(component.moreSpecifics.resources[0].status).toEqual("ASSIGNED");
        expect(component.moreSpecifics.resources[0].netname).toEqual("DK-TELIANET");
    });
});

const MORE_SPECIFIC_INETNUM_MOCK = {
    "resources": [
        {
            "type": "inetnum",
            "resource": "62.20.0.0 - 62.20.0.31",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "SE-SKISTAR",
            "usage": {
                "total": 32,
                "used": 32,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.32 - 62.20.0.47",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "SE-RATTVIK",
            "usage": {
                "total": 16,
                "used": 16,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.48 - 62.20.0.63",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "AKERSTROMS-BJORBO",
            "usage": {
                "total": 16,
                "used": 16,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.64 - 62.20.0.71",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "SE-AXFOOD",
            "usage": {
                "total": 8,
                "used": 8,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.72 - 62.20.0.79",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "SE-TIPPTOPP",
            "usage": {
                "total": 8,
                "used": 8,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.80 - 62.20.0.95",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "TEMA-FONSTER",
            "usage": {
                "total": 16,
                "used": 16,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.96 - 62.20.0.111",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "US-MODMISSIONCRITICAL",
            "usage": {
                "total": 16,
                "used": 16,
                "blockSize": 32
            }
        },
        {
            "type": "inetnum",
            "resource": "62.20.0.112 - 62.20.0.119",
            "status": "ASSIGNED PA",
            "iRR": false,
            "rDNS": false,
            "netname": "SE-GRSANERING",
            "usage": {
                "total": 8,
                "used": 8,
                "blockSize": 32
            }
        }]
};
const MORE_SPECIFIC_INET6NUM_MOCK = {
    "resources": [
        {
            "type": "inet6num",
            "resource": "2001:2000:1002::/48",
            "status": "ASSIGNED",
            "iRR": false,
            "rDNS": false,
            "netname": "DK-TELIANET",
            "usage": {
                "total": 1,
                "used": 1,
                "blockSize": 48
            }
        }
    ],
    "totalNumberOfResources": 1,
    "filteredSize": 1,
    "pageSize": 1
};
