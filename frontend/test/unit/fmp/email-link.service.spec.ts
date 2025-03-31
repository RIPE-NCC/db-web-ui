import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmailLinkService } from '../../../src/app/fmp/email-link.services';

describe('EmailLinkService', () => {
    let emailLinkService: EmailLinkService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [EmailLinkService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        emailLinkService = TestBed.inject(EmailLinkService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(emailLinkService).toBeTruthy();
    });

    it('should get email link', () => {
        emailLinkService.get('validhash').subscribe((respons: any) => {
            expect(respons).toBe('response');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/fmp-pub/emaillink/validhash.json' });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });

    it('should update email link', () => {
        emailLinkService.update('validhash').subscribe((respons: any) => {
            expect(respons).toBe('response');
        });
        const req = httpMock.expectOne({ method: 'PUT', url: 'api/whois-internal/api/fmp-pub/emaillink/validhash.json' });
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.hash).toBe('validhash');
        req.flush('response');
    });
});
