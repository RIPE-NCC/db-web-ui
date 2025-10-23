import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { LoadingIndicatorComponent } from '../../../src/app/shared/loadingindicator/loading-indicator.component';
import { UnsubscribeComponent } from '../../../src/app/unsubscribe/unsubscribe.component';
import { UnsubscribeService } from '../../../src/app/unsubscribe/unsubscribe.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('UnsubscribeComponent', () => {
    const url = 'api/whois-internal/public/unsubscribe';

    let component: UnsubscribeComponent;
    let fixture: ComponentFixture<UnsubscribeComponent>;
    let httpMock: HttpTestingController;
    let service: UnsubscribeService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [UnsubscribeComponent, LoadingIndicatorComponent],
            providers: [
                UnsubscribeService,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (messageId: string) => '123456789012345678' } } } },
                { provide: UserInfoService, useValue: { data: throwError(() => 401) } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UnsubscribeComponent);
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UnsubscribeService);
        component = fixture.componentInstance;
        // component.messageId = '123456789012345678';
        fixture.detectChanges();
        expect(component.loading).toEqual(true);
        expect(component.unsubscribed).toEqual(false);
        expect(component.messageId).toEqual('123456789012345678');
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should show invalid link page', () => {
        const req = httpMock.expectOne({ method: 'POST', url });
        req.flush(null, { status: 400, statusText: '' });
        expect(component.loading).toEqual(false);
        expect(component.unsubscribed).toEqual(false);
    });

    it('should show confirmation page', () => {
        const req = httpMock.expectOne({ method: 'POST', url });
        req.flush(mockSuccessResponse.data);
        expect(component.loading).toEqual(false);
        expect(component.unsubscribed).toEqual(true);
    });
});

const mockSuccessResponse = {
    requestUrl: '/api/whois-internal/api/whois-internal/public/unsubscribe',
    contentType: 'application/javascript',
    statusCode: 200,
    data: { email: 'test@gmail.com' },
};
