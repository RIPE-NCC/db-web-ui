import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FindMaintainerService } from '../../../src/app/fmp/find-maintainer.service';
import { FmpErrorService } from '../../../src/app/fmp/fmp-error.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';

describe('FindMaintainerService', () => {
    let findMaintainerService: FindMaintainerService;
    let httpMock: HttpTestingController;
    let fmpErrorServiceSpy;

    beforeEach(() => {
        fmpErrorServiceSpy = jasmine.createSpyObj('FmpErrorService', ['isYourAccountBlockedError']);
        fmpErrorServiceSpy.isYourAccountBlockedError.and.returnValue(false);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FindMaintainerService,
                { provide: FmpErrorService, useValue: fmpErrorServiceSpy },
                AlertsService,
                WhoisResourcesService,
                WhoisMetaService,
                PropertiesService,
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        findMaintainerService = TestBed.inject(FindMaintainerService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should retrieve maintainer data', (done) => {
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
                                    value: 'test@ripe.net',
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
            expect(respons.email).toBe('test@ripe.net');
            done();
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should choose first upd-to address if multiple found', (done) => {
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
            done();
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should validate result expired', (done) => {
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
            expect(respons.expired).toBeFalse();
            done();
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        const reqValidation = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate' });
        expect(reqValidation.request.method).toBe('GET');
        reqValidation.flush(validateResp);
    });

    it('should return error maintainer not found', (done) => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 404, statusText: 'Not Found' };
        const data = 'Invalid request parameters';
        findMaintainerService.search(maintainerKey).subscribe({
            next: (res: any) => {},
            error: (error: any) => {
                expect(error).toBe('The maintainer could not be found.');
                done();
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(data, mockErrorResponse);
    });

    it('should return error fetching maintainer', (done) => {
        const maintainerKey = 'I-AM-MNT';
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        const data = 'Invalid request parameters';
        findMaintainerService.search(maintainerKey).subscribe({
            next: (res: any) => {},
            error: (error: any) => {
                expect(error).toBe('Error fetching maintainer.');
                done();
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(data, mockErrorResponse);
    });

    it('should return error that MNT is synchronized with organisation in LIR Portal', (done) => {
        const maintainerKey = 'SHRYANE-MNT';
        const mockErrorResponse = { status: 403, error: 'SHRYANE-MNT is synchronized with organisation ORG-BAd1-RIPE in LIR Portal.', statusText: 'OK' };
        findMaintainerService.search(maintainerKey).subscribe({
            next: () => {},
            error: (error: any) => {
                expect(fmpErrorServiceSpy.isYourAccountBlockedError).toHaveBeenCalled();
                expect(error.error).toBe('SHRYANE-MNT is synchronized with organisation ORG-BAd1-RIPE in LIR Portal.');
                done();
            },
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/mntner/SHRYANE-MNT' });
        expect(req.request.method).toBe('GET');
        req.flush(mockErrorResponse, mockErrorResponse);
    });

    it('should return error for validating email', (done) => {
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
                                    value: 'test@ripe.net',
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
            next: (res: any) => {},
            error: (error: any) => {
                expect(error).toBe('switchToManualResetProcess');
                done();
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
            next: (res: any) => {},
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
            next: (res: any) => {},
            error: (error: any) => {
                expect(error.message).toBe('Http failure response for api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json: 401 Unauthorized');
            },
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json' });
        expect(req.request.method).toBe('POST');
        req.flush(data, mockErrorResponse);
    });
});
