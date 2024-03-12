import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { LoadingIndicatorComponent } from '../../../src/app/shared/loadingindicator/loading-indicator.component';
import { UnsubscribeConfirmationComponent } from '../../../src/app/unsubscribeConfirmation/unsubscribe-confirm.component';
import { UnsubscribeConfirmService } from '../../../src/app/unsubscribeConfirmation/unsubscribe-confirm.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('UnsubscribeConfirmationComponent', () => {
    const url = 'api/whois-internal/public/unsubscribe?messageId=123456789012345678';

    let component: UnsubscribeConfirmationComponent;
    let fixture: ComponentFixture<UnsubscribeConfirmationComponent>;
    let httpMock: HttpTestingController;
    let service: UnsubscribeConfirmService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [UnsubscribeConfirmationComponent, LoadingIndicatorComponent],
            providers: [
                UnsubscribeConfirmService,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (messageId: string) => '123456789012345678' } } } },
                { provide: UserInfoService, useValue: { data: throwError(() => 401) } }, // not logged in user
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UnsubscribeConfirmationComponent);
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UnsubscribeConfirmService);
        component = fixture.componentInstance;
        component.messageId = '123456789012345678';
        fixture.detectChanges();
        expect(component.loading).toEqual(true);
        expect(component.isSucess).toEqual(false);
        expect(component.messageId).toEqual('123456789012345678');
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should show invalid link page', () => {
        const req = httpMock.expectOne({ method: 'GET', url });
        req.flush('', { status: 400, statusText: '' });
        expect(component.loading).toEqual(false);
        expect(component.isSucess).toEqual(false);
        expect(component.email).toEqual(undefined);
    });

    it('should show confirmation page', () => {
        const req = httpMock.expectOne({ method: 'GET', url });
        req.flush(mockSuccessResponse.data);

        expect(component.loading).toEqual(false);
        expect(component.isSucess).toEqual(true);
        expect(component.email).toEqual('test@gmail.com');
    });
});

const mockSuccessResponse = {
    requestUrl: '/api/whois-internal/public/unsubscribe',
    contentType: 'application/javascript',
    data: 'test@gmail.com',
    statusCode: 200,
};
