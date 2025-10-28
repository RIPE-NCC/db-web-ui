import { HttpInterceptorFn } from '@angular/common/http';

export const SKIP_HEADER = 'X-skip-header';

export const HeaderInterceptor: HttpInterceptorFn = (req, next) => {
    // If this request should skip headers, remove the marker and pass through
    if (req.headers.has(SKIP_HEADER)) {
        const headers = req.headers.delete(SKIP_HEADER);
        return next(req.clone({ headers }));
    }

    // Otherwise, add default headers
    const jsonReq = req.clone({
        setHeaders: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    return next(jsonReq);
};
