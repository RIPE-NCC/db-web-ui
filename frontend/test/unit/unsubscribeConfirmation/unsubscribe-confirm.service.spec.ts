import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UnsubscribeConfirmService } from '../../../src/app/unsubscribeConfirmation/unsubscribe-confirm.service';

describe('UnsubscribeConfirmService', () => {
    let unsubscribeConfirmService: UnsubscribeConfirmService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UnsubscribeConfirmService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        unsubscribeConfirmService = TestBed.inject(UnsubscribeConfirmService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(unsubscribeConfirmService).toBeTruthy();
    });

    it('should return email for a messageId', () => {
        unsubscribeConfirmService.getEmailFromMessageId('messageId').subscribe((response: string) => {
            expect(response).toBe('test@ripe.net');
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/public/unsubscribe?messageId=messageId' });
        expect(req.request.method).toBe('GET');
    });
});
