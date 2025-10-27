import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionInfoService } from './session-info.service';

@Injectable({ providedIn: 'root' })
export class SessionInterceptor implements HttpInterceptor {
    private sessionInfoService = inject(SessionInfoService);

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    //we are still logged, we need to refresh
                    if (event.status === 200 && req.url.includes('/whois-internal/api/user/info')) {
                        this.sessionInfoService.startCheckingSession();
                    }
                    return event;
                }
            }),
            catchError((err: HttpErrorResponse) => {
                //we receive a 401 from user info or we receive a 401 that expires the cookie
                if (err.status == 401 && (err.url.includes('/whois-internal/api/user/info') || !document.cookie.includes('crowd.ripe.hint'))) {
                    this.sessionInfoService.authenticationFailure();
                }
                return throwError(() => err);
            }),
        );
    }
}
