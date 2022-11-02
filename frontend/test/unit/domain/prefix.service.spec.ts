import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';

describe('PrefixService', () => {
    let prefixService: PrefixService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PrefixService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        prefixService = TestBed.inject(PrefixService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(prefixService).toBeTruthy();
    });

    describe('checkNameserverAsync', () => {
        it('should throw an error if no ns', (done) => {
            prefixService.checkNameserverAsync(undefined, 'zone').subscribe({
                next: null,
                error: (error) => {
                    expect(error).toBe('checkNameserverAsync called without ns');
                    done();
                },
            });
        });

        it('should throw an error if no zone', (done) => {
            prefixService.checkNameserverAsync('ns', undefined).subscribe({
                next: null,
                error: (error) => {
                    expect(error).toBe('checkNameserverAsync called without rDnsZone');
                    done();
                },
            });
        });

        it('should call the proper url when ns and zone', (done) => {
            prefixService.checkNameserverAsync('ns', 'zone').subscribe({
                next: (response) => {
                    expect(response).toBe('response');
                    done();
                },
            });
            const req = httpMock.expectOne({ method: 'GET', url: 'api/dns/status?ignore404=true&ns=ns&record=zone' });
            req.flush('response');
        });
    });

    describe('findExistingDomainsForPrefix', () => {
        it('should zip ', (done) => {
            prefixService.findExistingDomainsForPrefix('prefix').subscribe({
                next: (response: unknown) => {
                    expect(response[0].body).toBe('drx');
                    expect(response[1].body).toBe('drM');
                    done();
                },
            });
            const drxReq = httpMock.expectOne({
                method: 'GET',
                url: 'api/rest/search?flags=drx&ignore404=true&query-string=prefix&type-filter=domain',
            });
            const drMReq = httpMock.expectOne({
                method: 'GET',
                url: 'api/rest/search?flags=drM&ignore404=true&query-string=prefix&type-filter=domain',
            });
            drxReq.flush('drx');
            drMReq.flush('drM');
        });
    });

    describe('getDomainCreationStatus', () => {
        it('should call proper url', (done) => {
            prefixService.getDomainCreationStatus('RIPE').subscribe({
                next: (response) => {
                    expect(response.body).toBe('response');
                    done();
                },
            });
            const req = httpMock.expectOne({ method: 'GET', url: 'api/whois/domain-objects/RIPE/status' });
            req.flush('response');
        });
    });
});
