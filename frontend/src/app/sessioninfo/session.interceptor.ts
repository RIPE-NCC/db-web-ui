import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionInfoService } from './session-info.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
    constructor(private sessionInfoService: SessionInfoService) {}

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    //we are still logged, we need to refresh
                    if (event.status === 200 && req.url.includes('/whois-internal/')) {
                        this.sessionInfoService.refreshSession();
                    }
                    return event;
                }
            }),
            catchError((err: HttpErrorResponse) => {
                if (err.status == 401) {
                    this.sessionInfoService.authenticationFailure();
                }
                return throwError(() => err);
            }),
        );
    }
}
