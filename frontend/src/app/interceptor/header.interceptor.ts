import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const SKIP_HEADER = 'X-skip-header';
@Injectable({ providedIn: 'root' })
export class HeaderInterceptor implements HttpInterceptor {
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers.has(SKIP_HEADER)) {
            const headers = req.headers.delete(SKIP_HEADER);
            return next.handle(req.clone({ headers }));
        }
        const jsonReq: HttpRequest<any> = req.clone({
            setHeaders: {
                'Content-Type': 'application/json; charset=utf-8',
                // Always tell server if request was made using ajax
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        return next.handle(jsonReq);
    }
}
