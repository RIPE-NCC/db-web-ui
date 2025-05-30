import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../../src/app/app.module';
import { MyResourcesModule } from '../../../src/app/myresources/my-resources.module';
import { IResourceTickets } from '../../../src/app/myresources/resource-type.model';
import { ResourcesDataService } from '../../../src/app/myresources/resources-data.service';

const TEST_ORG_ID = 'ORG-ITEST-RIPE';

const TEST_RESOURCE = '185.149.24.0%20-%20185.149.27.255';

const responseResourceOverviewResponseModel = {
    stats: {
        numInetnums: 1,
        numInet6nums: 1,
        numAutnums: 3,
        numSponsoredInetnums: 1,
        numSponsoredInet6nums: 0,
        numSponsoredAutnums: 0,
    },
    orgId: 'ORG-AL250-RIPE',
    resources: [
        {
            type: 'inetnum',
            resource: '185.62.164.0 - 185.62.167.255',
            status: 'ALLOCATED PA',
            netname: 'NETNAME-TEST30',
            usage: {
                total: 1024,
                used: 512,
                blockSize: 32,
            },
        },
    ],
    totalNumberOfResources: 1,
    filteredSize: 1,
    pageSize: 1,
};

const ticketAndDateResponse = {
    tickets: {
        '185.149.24.0 - 185.149.27.255': [
            {
                number: 'NCC#2016044085',
                date: '2016-04-25',
                resource: '185.149.24.0/22',
            },
        ],
    },
};
describe('ResourcesDataService', () => {
    let resourcesDataService: ResourcesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MyResourcesModule, AppModule],
            providers: [
                ResourcesDataService,
                { provide: '$log', useValue: { info: () => {} } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
        resourcesDataService = TestBed.inject(ResourcesDataService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(resourcesDataService).toBeTruthy();
    });

    it('should populate IPv4 Resources', () => {
        resourcesDataService.fetchResources(TEST_ORG_ID, 'inetnum', false).subscribe((resp) => {
            expect(resp).toBe(responseResourceOverviewResponseModel);
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/resources?org-id=ORG-ITEST-RIPE&type=inetnum' });
        expect(req.request.method).toBe('GET');
        req.flush(responseResourceOverviewResponseModel);
    });

    it('should fetch tickets and dates', () => {
        resourcesDataService.fetchTicketsAndDates(TEST_ORG_ID, TEST_RESOURCE).subscribe((response) => {
            expect(response).toBe(ticketAndDateResponse);
        });

        const req = httpMock.expectOne({ method: 'GET', url: `api/ba-apps/resources/${TEST_ORG_ID}/${TEST_RESOURCE}` });
        expect(req.request.method).toBe('GET');
        req.flush(ticketAndDateResponse);
    });

    it('should catch and resolve exception when fetching tickets and dates', () => {
        resourcesDataService.fetchTicketsAndDates(TEST_ORG_ID, TEST_RESOURCE).subscribe((response: IResourceTickets) => {
            expect(response).toEqual({
                tickets: {
                    [TEST_RESOURCE]: [],
                },
            });
        });

        const req = httpMock.expectOne({ method: 'GET', url: `api/ba-apps/resources/${TEST_ORG_ID}/${TEST_RESOURCE}` });
        req.error(null);

        expect(req.request.method).toBe('GET');
    });
});
