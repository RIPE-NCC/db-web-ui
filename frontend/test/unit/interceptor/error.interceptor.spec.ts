import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { ErrorInterceptor } from 'src/app/interceptor/error.interceptor';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';

describe('ErrorInterceptor', () => {
    let mockRouter: jasmine.SpyObj<Router>;
    let mockProperties: jasmine.SpyObj<PropertiesService>;
    let mockAlertsService: jasmine.SpyObj<AlertsService>;
    let mockHandler: jasmine.SpyObj<{ handle: (req: HttpRequest<any>) => any }>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/test' });
        mockProperties = jasmine.createSpyObj('PropertiesService', [], { LOGIN_URL: 'http://sso.test/login' });
        mockAlertsService = jasmine.createSpyObj('AlertsService', ['setGlobalError']);
        mockHandler = jasmine.createSpyObj('HttpHandlerFn', ['handle']);

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: PropertiesService, useValue: mockProperties },
                { provide: AlertsService, useValue: mockAlertsService },
            ],
        });
    });

    function makeError(status: number, url: string = 'http://localhost/api/test', body: any = {}): HttpErrorResponse {
        return new HttpErrorResponse({ status, url, error: body });
    }

    it('should navigate to /error on 500', (done) => {
        mockHandler.handle.and.returnValue(throwError(() => makeError(500)));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith(['error']);
                    done();
                },
            }),
        );
    });

    it('should navigate to /not-found on 404', (done) => {
        mockHandler.handle.and.returnValue(throwError(() => makeError(404)));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith(['not-found']);
                    done();
                },
            }),
        );
    });

    // fit('should call handleTransitionError on 401 with matching url', (done) => {
    //     const err = makeError(401, 'http://localhost/myresources/data');
    //     mockHandler.handle.and.returnValue(throwError(() => err));
    //
    //     spyOn<any>(ErrorInterceptor, 'redirectToLogin');
    //
    //     TestBed.runInInjectionContext(() =>
    //         ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
    //         error: () => {
    //             expect(ErrorInterceptor['redirectToLogin']).toHaveBeenCalled();
    //             done();
    //         },
    //     })
    //     );
    // });

    it('should show block user banner on 429', (done) => {
        const err = makeError(429, 'http://localhost/api/test', {
            errormessages: { errormessage: [{ text: 'Blocked user' }] },
        });
        mockHandler.handle.and.returnValue(throwError(() => err));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockAlertsService.setGlobalError).toHaveBeenCalledWith(
                        'Blocked user',
                        'https://apps.db.ripe.net/docs/FAQ/#why-did-i-receive-an-error-201-access-denied',
                        'More information',
                    );
                    done();
                },
            }),
        );
    });
});
