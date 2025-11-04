import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MoreSpecificsService } from '../../../src/app/myresources/morespecifics/more-specifics.service';

describe('MoreSpecificsService', () => {
    let moreSpecificsService: MoreSpecificsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [MoreSpecificsService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        moreSpecificsService = TestBed.inject(MoreSpecificsService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(moreSpecificsService).toBeTruthy();
    });

    it('should reject when objectType is empty', (done) => {
        moreSpecificsService.getSpecifics('', '', undefined, '').subscribe({
            next: () => {},
            error: (error: any) => {
                expect(error).toEqual('objectType is empty. more-specifics not available');
                done();
            },
        });
    });

    it('should reject when objectType is empty', (done) => {
        moreSpecificsService.getSpecifics('OBJECT_NAME', '', undefined, '').subscribe({
            next: () => {},
            error: (error: any) => {
                expect(error).toEqual('objectType is empty. more-specifics not available');
                done();
            },
        });
    });

    it('should reject when objectName is empty', (done) => {
        moreSpecificsService.getSpecifics('', 'OBJECT_TYPE', undefined, '').subscribe({
            next: () => {},
            error: (error: any) => {
                expect(error).toEqual('objectName is empty. more-specifics not available');
                done();
            },
        });
    });

    it('should do proper request without filter', (done) => {
        moreSpecificsService.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', 0, '').subscribe((res: any) => {
            expect(res).toEqual({ resp: 'lol' });
            done();
        });
        const req1 = httpMock.expectOne({
            method: 'GET',
            url: 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=&page=0',
        });
        expect(req1.request.method).toBe('GET');
        req1.flush({ resp: 'lol' });
    });

    it('should do proper reuqest with filter', (done) => {
        moreSpecificsService.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', 0, 'FILTER').subscribe((res: any) => {
            expect(res).toEqual({ resp: 'lol' });
            done();
        });
        const req2 = httpMock.expectOne({
            method: 'GET',
            url: 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=0',
        });
        expect(req2.request.method).toBe('GET');
        req2.flush({ resp: 'lol' });
    });

    it('should proper request for page', (done) => {
        moreSpecificsService.getSpecifics('OBJECT_NAME', 'OBJECT_TYPE', 1, 'FILTER').subscribe((res: any) => {
            expect(res).toEqual({ resp: 'lol' });
            done();
        });
        const req3 = httpMock.expectOne({
            method: 'GET',
            url: 'api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=1',
        });
        expect(req3.request.method).toBe('GET');
        req3.flush({ resp: 'lol' });
    });
});
