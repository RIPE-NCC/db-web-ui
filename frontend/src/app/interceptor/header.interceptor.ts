import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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
