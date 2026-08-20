import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../sessioninfo/session.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const sessionService = inject(SessionService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                sessionService.showSessionExpired();
            }

            return throwError(() => error);
        }),
    );
};
