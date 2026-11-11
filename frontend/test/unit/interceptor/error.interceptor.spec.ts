import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { ErrorInterceptor } from 'src/app/interceptor/error.interceptor';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';
import type { MockedObject } from 'vitest';

describe('ErrorInterceptor', () => {
    let mockRouter: MockedObject<Router>;
    let mockProperties: MockedObject<PropertiesService>;
    let mockAlertsService: MockedObject<AlertsService>;
    let mockHandler: MockedObject<{
        handle: (req: HttpRequest<any>) => any;
    }>;
    const routerEvents$ = new Subject();

    beforeEach(() => {
        mockRouter = {
            navigate: vi.fn().mockName('Router.navigate'),
            url: '/test',
            events: routerEvents$.asObservable(),
        } as any;
        mockProperties = {
            LOGIN_URL: 'http://sso.test/login',
        } as any;
        mockAlertsService = {
            setGlobalError: vi.fn().mockName('AlertsService.setGlobalError'),
        } as any;
        mockHandler = {
            handle: vi.fn().mockName('HttpHandlerFn.handle'),
        };

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

    it('should navigate to /error on 500', async () => {
        mockHandler.handle.mockReturnValue(throwError(() => makeError(500)));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith(['error']);
                },
            }),
        );
    });

    it('should navigate to /not-found on 404', async () => {
        mockHandler.handle.mockReturnValue(throwError(() => makeError(404)));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith(['not-found']);
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

    it('should show block user banner on 429', async () => {
        const err = makeError(429, 'http://localhost/api/test', {
            errormessages: { errormessage: [{ text: 'Blocked user' }] },
        });
        mockHandler.handle.mockReturnValue(throwError(() => err));

        TestBed.runInInjectionContext(() =>
            ErrorInterceptor(new HttpRequest('GET', '/data'), (req) => mockHandler.handle(req)).subscribe({
                error: () => {
                    expect(mockAlertsService.setGlobalError).toHaveBeenCalledWith(
                        'Blocked user',
                        'https://apps.db.ripe.net/docs/FAQ#why-did-i-receive-an-error-201-access-denied',
                        'More information',
                    );
                },
            }),
        );
    });
});
