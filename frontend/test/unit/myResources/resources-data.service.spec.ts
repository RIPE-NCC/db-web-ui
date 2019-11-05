import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {MyResourcesModule} from "../../../src/app/myresources/my-resources.module";
import {ResourcesDataService} from "../../../src/app/myresources/resources-data.service";

describe("ResourcesDataService", () => {
    let resourcesDataService: ResourcesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MyResourcesModule],
            providers: [
                ResourcesDataService,
                { provide: "$log", useValue: {info: () => {}}}
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        resourcesDataService = TestBed.get(ResourcesDataService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(resourcesDataService).toBeTruthy();
    });

    it("should populate IPv4 Resources", () => {
        resourcesDataService.fetchResources("ORG-IOB1-RIPE", "inetnum", false)
            .subscribe((resp) => {
            expect(resp).toBe(responseResourceOverviewResponseModel);
        });
        const req = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/resources?org-id=ORG-IOB1-RIPE&type=inetnum"});
        expect(req.request.method).toBe("GET");
        req.flush(responseResourceOverviewResponseModel);
    });
});

const responseResourceOverviewResponseModel = {
        "stats": {
            "numInetnums": 1,
            "numInet6nums": 1,
            "numAutnums": 3,
            "numSponsoredInetnums": 1,
            "numSponsoredInet6nums": 0,
            "numSponsoredAutnums": 0
        },
        "orgId": "ORG-AL250-RIPE",
        "resources": [
            {
                "type": "inetnum",
                "resource": "185.62.164.0 - 185.62.167.255",
                "status": "ALLOCATED PA",
                "netname": "IE-AFILIAS-LTD-20140702",
                "usage": {
                    "total": 1024,
                    "used": 512,
                    "blockSize": 32
                }
            }
        ],
        "totalNumberOfResources": 1,
        "filteredSize": 1,
        "pageSize": 1
    };
