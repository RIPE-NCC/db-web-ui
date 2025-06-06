import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SyncupdatesService } from '../../../src/app/syncupdates/syncupdates.service';

describe('SyncupdatesService', () => {
    let httpMock: HttpTestingController;
    let service: SyncupdatesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SyncupdatesService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SyncupdatesService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should trim and encode rpslObject content', () => {
        const rpslObject = ' some@data ';
        service.update(rpslObject).subscribe((resp) => {
            expect(resp).toBe('{"data":"some%40data"}');
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/syncupdates' });
        expect(req.request.method).toBe('POST');
        req.flush({ data: 'some%40data' });
    });
});
