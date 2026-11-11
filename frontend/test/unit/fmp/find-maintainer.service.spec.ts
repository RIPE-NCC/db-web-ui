import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FindMaintainerService } from 'src/app/fmp/find-maintainer.service';
import { FmpErrorService } from 'src/app/fmp/fmp-error.service';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';
import { WhoisMetaService } from 'src/app/shared/whois-meta.service';
import { WhoisResourcesService } from 'src/app/shared/whois-resources.service';

describe('FindMaintainerService', () => {
    let findMaintainerService: FindMaintainerService;
    let httpMock: HttpTestingController;
    let fmpErrorServiceSpy;

    beforeEach(() => {
        fmpErrorServiceSpy = {
            isYourAccountBlockedError: vi.fn().mockName('FmpErrorService.isYourAccountBlockedError'),
        };
        fmpErrorServiceSpy.isYourAccountBlockedError.mockReturnValue(false);
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                FindMaintainerService,
                { provide: FmpErrorService, useValue: fmpErrorServiceSpy },
                AlertsService,
                WhoisResourcesService,
                WhoisMetaService,
                PropertiesService,
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        findMaintainerService = TestBed.inject(FindMaintainerService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should retrieve maintainer data', async () => {
        const maintainerKey = 'I-AM-MNT';
        const response = {
            objects: {
                object: [
                    {
                        name: 'world',
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'I-AM-MNT' },
                                {
                                    name: 'upd-to',
                                    value: 'TSTADMINC-RIPE',
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const validateResp = { expired: false };
        findMaintainerService.search(maintainerKey).subscribe((respons: any) => {
            expect(respons.mntnerFound).toBeTruthy();
            expect(respons.selectedMaintainer.name).toBe('world');
            expect(respons.email).toBe('TSTADMINC-RIPE');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should choose first upd-to address if multiple found', async () => {
        const maintainerKey = 'I-AM-MNT';
        const response = {
            objects: {
                object: [
                    {
                        name: 'world',
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'I-AM-MNT' },
                                { name: 'upd-to', value: 'first@ripe.net' },
                                { name: 'upd-to', value: 'second@ripe.net' },
                            ],
                        },
                    },
                ],
            },
        };
        const validateResp = { expired: false };
        findMaintainerService.search(maintainerKey).subscribe((respons: any) => {
            expect(respons.mntnerFound).toBeTruthy();
            expect(respons.selectedMaintainer.name).toBe('world');
            expect(respons.email).toBe('first@ripe.net');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should validate result expired', async () => {
        const maintainerKey = 'I-AM-MNT';
        const response = {
            objects: {
                object: [
                    {
                        name: 'world',
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'I-AM-MNT' },
                                { name: 'upd-to', value: 'first@ripe.net' },
                                { name: 'upd-to', value: 'second@ripe.net' },
                            ],
                        },
                    },
                ],
            },
        };
        const validateResp = { expired: false };
        findMaintainerService.search(maintainerKey).subscribe((respons: any) => {
            expect(respons.mntnerFound).toBeTruthy();
            expect(respons.selectedMaintainer.name).toBe('world');
            expect(respons.email).toBe('first@ripe.net');
            expect(respons.expired).toBe(false);
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should return error maintainer not found', async () => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 404, statusText: 'Not Found' };
        const data = 'Invalid request parameters';
        findMaintainerService.search(maintainerKey).subscribe({
            next: (_res: any) => {},
            error: (error: any) => {
                expect(error).toBe('The maintainer could not be found.');
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(data, mockErrorResponse);
    });

    it('should return error fetching maintainer', async () => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        const data = 'Invalid request parameters';
        findMaintainerService.search(maintainerKey).subscribe({
            next: (_res: any) => {},
            error: (error: any) => {
                expect(error).toBe('Error fetching maintainer.');
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(data, mockErrorResponse);
    });

    it('should return error that MNT is synchronized with organisation in LIR Portal', async () => {
        const maintainerKey = 'SHRYANE-MNT';
        const mockErrorResponse = { status: 403, error: 'SHRYANE-MNT is synchronized with organisation ORG-BAd1-RIPE in LIR Portal.', statusText: 'OK' };
        findMaintainerService.search(maintainerKey).subscribe({
            next: () => {},
            error: (error: any) => {
                expect(fmpErrorServiceSpy.isYourAccountBlockedError).toHaveBeenCalled();
                expect(error.error).toBe('SHRYANE-MNT is synchronized with organisation ORG-BAd1-RIPE in LIR Portal.');
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/SHRYANE-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(mockErrorResponse, mockErrorResponse);
    });

    it('should return error for validating email', async () => {
        const maintainerKey = 'I-AM-MNT';
        const response = {
            objects: {
                object: [
                    {
                        name: 'world',
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'I-AM-MNT' },
                                {
                                    name: 'upd-to',
                                    value: 'TSTADMINC-RIPE',
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
        const data = 'Invalid request parameters';
        findMaintainerService.search(maintainerKey).subscribe({
            next: (_res: any) => {},
            error: (error: any) => {
                expect(error).toBe('switchToManualResetProcess');
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(data, mockErrorResponse);
    });

    it('should successfully sent email', () => {
        const maintainerKey = 'I-AM-MNT';
        const response = {
            mntner: 'WORLD',
            email: 'a@b.c',
        };
        findMaintainerService.sendMail(maintainerKey).subscribe((res: any) => {
            expect(res).toBe(response);
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json' });
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });

    it('should report error validating mail', () => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        const data = 'unable to send emaill';
        findMaintainerService.sendMail(maintainerKey).subscribe({
            next: (_res: any) => {},
            error: (error: any) => {
                expect(error.message).toBe(
                    'Http failure response for api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json: 500 Internal Server Error',
                );
            },
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json' });
        expect(req.request.method).toBe('POST');
        req.flush(data, mockErrorResponse);
    });

    it('should report error validating mail', () => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 404, statusText: 'Not Found' };
        const data = 'unable to send email';
        findMaintainerService.sendMail(maintainerKey).subscribe({
            next: () => {},
            error: (error: any) => {
                expect(error.message).toBe('Http failure response for api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json: 404 Not Found');
            },
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json' });
        expect(req.request.method).toBe('POST');
        req.flush(data, mockErrorResponse);
    });

    it('should report error email unauthorized', () => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 401, statusText: 'Unauthorized' };
        const data = 'unable to send email';
        findMaintainerService.sendMail(maintainerKey).subscribe({
            next: (_res: any) => {},
            error: (error: any) => {
                expect(error.message).toBe('Http failure response for api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json: 401 Unauthorized');
            },
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json' });
        expect(req.request.method).toBe('POST');
        req.flush(data, mockErrorResponse);
    });
});
