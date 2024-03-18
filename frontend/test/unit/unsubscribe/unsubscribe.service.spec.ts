import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UnsubscribeService } from '../../../src/app/unsubscribe/unsubscribe.service';

describe('UnsubscribeService', () => {
    let unsubscribeService: UnsubscribeService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UnsubscribeService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        unsubscribeService = TestBed.inject(UnsubscribeService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(unsubscribeService).toBeTruthy();
    });

    it('should post to unsubscribe api and return email', () => {
        unsubscribeService.unsubscribe('messageId').subscribe((respons: string) => {
            expect(respons).toBe('test@ripe.net');
        });
        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois-internal/public/unsubscribe' });
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toBe('messageId');
        req.flush('test@ripe.net');
    });

    it('should return email for a messageId', () => {
        unsubscribeService.getEmailFromMessageId('messageId').subscribe((response: string) => {
            expect(response).toBe('test@ripe.net');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/public/unsubscribe?messageId=messageId' });
        expect(req.request.method).toBe('GET');
    });
});
