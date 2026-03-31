import { TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IpAnalyserService } from '../../../src/app/ip-analyser/ip-analyser.service';

describe('IpAnalyserService', () => {
    let service: IpAnalyserService;
    let httpMock: HttpTestingController;
    const orgId = 'ORG-TEST-1';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IpAnalyserService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(IpAnalyserService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get ipv4 Analysis', () => {
        service.getIpv4Analysis(orgId).subscribe((response) => {
            expect(response).toEqual(mockIpvAnalyserResponse);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/public/ipanalyser/v2/ipv4?org-id=ORG-TEST-1' });
        expect(request.request.method).toBe('GET');
        request.flush(mockIpvAnalyserResponse);
    });

    it('should get ipv6 Analysis', () => {
        service.getIpv6Analysis(orgId).subscribe((response) => {
            expect(response).toEqual(mockIpvAnalyserResponse);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/public/ipanalyser/v2/ipv6?org-id=ORG-TEST-1' });
        expect(request.request.method).toBe('GET');
        request.flush(mockIpvAnalyserResponse);
    });
});

const mockIpvAnalyserResponse = `TEST
RESPONSE
FORMAT TEXT`;
