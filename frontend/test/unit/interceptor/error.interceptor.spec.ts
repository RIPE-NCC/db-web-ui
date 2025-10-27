import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { ErrorInterceptor } from 'src/app/interceptor/error.interceptor';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';

describe('ErrorInterceptor', () => {
    let interceptor: ErrorInterceptor;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockProperties: jasmine.SpyObj<PropertiesService>;
    let mockAlertsService: jasmine.SpyObj<AlertsService>;
    let mockHandler: jasmine.SpyObj<HttpHandler>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/test' });
        mockProperties = jasmine.createSpyObj('PropertiesService', [], { LOGIN_URL: 'http://sso.test/login' });
        mockAlertsService = jasmine.createSpyObj('AlertsService', ['setGlobalError']);
        mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

        TestBed.configureTestingModule({
            providers: [
                ErrorInterceptor,
                { provide: Router, useValue: mockRouter },
                { provide: PropertiesService, useValue: mockProperties },
                { provide: AlertsService, useValue: mockAlertsService },
            ],
        });
        interceptor = TestBed.inject(ErrorInterceptor);
    });

    function makeError(status: number, url: string = 'http://localhost/api/test', body: any = {}) {
        return new HttpErrorResponse({ status, url, error: body });
    }

    it('should navigate to /error on 500', (done) => {
        mockHandler.handle.and.returnValue(throwError(() => makeError(500)));

        interceptor.intercept(new HttpRequest('GET', '/data'), mockHandler).subscribe({
            error: () => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['error']);
                done();
            },
        });
    });

    it('should navigate to /not-found on 404', (done) => {
        mockHandler.handle.and.returnValue(throwError(() => makeError(404)));

        interceptor.intercept(new HttpRequest('GET', '/data'), mockHandler).subscribe({
            error: () => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['not-found']);
                done();
            },
        });
    });

    it('should call handleTransitionError on 401 with matching url', (done) => {
        const err = makeError(401, 'http://localhost/myresources/data');
        mockHandler.handle.and.returnValue(throwError(() => err));

        // Spy on redirectToLogin (since it changes window.location)
        spyOn<any>(interceptor, 'redirectToLogin');

        interceptor.intercept(new HttpRequest('GET', '/data'), mockHandler).subscribe({
            error: () => {
                expect(interceptor['redirectToLogin']).toHaveBeenCalled();
                done();
            },
        });
    });

    it('should call showBlockUserBanner on 429', (done) => {
        const err = makeError(429, 'http://localhost/api/test', {
            errormessages: { errormessage: [{ text: 'Blocked user' }] },
        });
        mockHandler.handle.and.returnValue(throwError(() => err));

        interceptor.intercept(new HttpRequest('GET', '/data'), mockHandler).subscribe({
            error: () => {
                expect(mockAlertsService.setGlobalError).toHaveBeenCalledWith(
                    'Blocked user',
                    'https://apps.db.ripe.net/docs/FAQ/#why-did-i-receive-an-error-201-access-denied',
                    'More information',
                );
                done();
            },
        });
    });

    it('should swallow error if mustErrorBeSwallowed returns true', (done) => {
        const err = makeError(500, 'http://localhost/api/user/info');
        mockHandler.handle.and.returnValue(throwError(() => err));

        spyOn<any>(interceptor, 'mustErrorBeSwallowed').and.returnValue(true);

        interceptor.intercept(new HttpRequest('GET', '/data'), mockHandler).subscribe({
            error: () => {
                expect(interceptor['mustErrorBeSwallowed']).toHaveBeenCalledWith(err);
                expect(mockRouter.navigate).not.toHaveBeenCalled();
                done();
            },
        });
    });
});
