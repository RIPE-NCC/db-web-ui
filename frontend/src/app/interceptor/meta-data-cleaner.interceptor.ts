import { HttpInterceptorFn } from '@angular/common/http';

export const MetaDataCleanerInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.body && typeof req.body === 'object') {
        const newBody = JSON.parse(JSON.stringify(req.body, toJsonReplacer));
        const jsonReq = req.clone({ body: newBody });
        return next(jsonReq);
    }

    return next(req);
};

const toJsonReplacer = (key: string, value: any) => {
    return typeof key === 'string' && key.startsWith('$$') ? undefined : value;
};
