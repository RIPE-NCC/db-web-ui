import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UnsubscribeConfirmService } from '../../../src/app/unsubscribeConfirmation/unsubscribe-confirm.service';

describe('UnsubscribeService', () => {
    let unsubscribeService: UnsubscribeConfirmService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UnsubscribeConfirmService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        unsubscribeService = TestBed.inject(UnsubscribeConfirmService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(unsubscribeService).toBeTruthy();
    });

    it('should return email for a messageId', () => {
        unsubscribeService.getEmailFromMessageId('messageId').subscribe((response: string) => {
            expect(response).toBe('test@ripe.net');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/public/unsubscribe/messageId' });
        expect(req.request.method).toBe('GET');
    });
});
