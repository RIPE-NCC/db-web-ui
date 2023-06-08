import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionInfoService } from './session-info.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
    constructor(private sessionInfoService: SessionInfoService) {}

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status == 401) {
                    this.sessionInfoService.authenticationFailure();
                }
                return throwError(() => err);
            }),
        );
    }
}
