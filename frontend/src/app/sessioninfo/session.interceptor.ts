import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { SessionInfoService } from './session-info.service';

export const SessionInterceptor: HttpInterceptorFn = (req, next) => {
    const sessionInfoService = inject(SessionInfoService);

    return next(req).pipe(
        map((event) => {
            if (event instanceof HttpResponse) {
                // Still logged in → refresh session
                if (event.status === 200 && req.url.includes('/whois-internal/api/user/info')) {
                    sessionInfoService.startCheckingSession();
                }
            }
            return event;
        }),
        catchError((err: HttpErrorResponse) => {
            // Handle session expiration
            if (err.status === 401 && (err.url?.includes('/whois-internal/api/user/info') || !document.cookie.includes('crowd.ripe.hint'))) {
                sessionInfoService.authenticationFailure();
            }
            return throwError(() => err);
        }),
    );
};
