import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ForgotMaintainerPasswordService } from '../../../src/app/fmp/forgot-maintainer-password.service';

describe('ForgotMaintainerPasswordService', () => {
    let forgotMaintainerPasswordService: ForgotMaintainerPasswordService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ForgotMaintainerPasswordService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        forgotMaintainerPasswordService = TestBed.inject(ForgotMaintainerPasswordService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(forgotMaintainerPasswordService).toBeTruthy();
    });

    it('should generate pdf and email', () => {
        const forgotMaintainerPassword = {
            mntnerKey: 'mnt-key',
            reason: 'Testing reason',
            email: 'test@test.com',
            voluntary: false,
        };
        const url = 'api/whois-internal/api/fmp-pub/forgotmntnerpassword';
        forgotMaintainerPasswordService.generatePdfAndEmail(forgotMaintainerPassword).subscribe((respons: any) => {
            expect(respons).toBe(url + '/' + btoa(JSON.stringify(forgotMaintainerPassword)));
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/api/fmp-pub/forgotmntnerpassword' });
        expect(req.request.method).toBe('POST');
        req.flush('response');
    });
});
