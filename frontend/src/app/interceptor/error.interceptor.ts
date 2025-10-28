import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { catchError, throwError } from 'rxjs';

import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const properties = inject(PropertiesService);
    const alertService = inject(AlertsService);

    const isServerError = (status: number) => status === 500;
    const isAuthorisationError = (status: number) => status === 401;
    const isForbiddenError = (status: number) => status === 403;
    const isNotFoundError = (status: number) => status === 404;

    const mustErrorBeSwallowed = (error: HttpErrorResponse) => {
        let toBeSwallowed = false;

        console.debug('ui-url:' + router.url);
        console.debug('http-status:' + error.status);
        if (!_.isUndefined(error)) {
            console.debug('rest-url:' + error.url);
            if ((isServerError(error.status) || isAuthorisationError(error.status)) && _.endsWith(error.url, 'api/user/info')) {
                toBeSwallowed = true;
            }
            if (isForbiddenError(error.status) && _.endsWith(error.url, 'api/user/info')) {
                toBeSwallowed = true;
            }
            if (error.url?.includes('/rpki/roa')) {
                toBeSwallowed = true;
            }
            if (isNotFoundError(error.status)) {
                if (_.startsWith(error.url, 'api/whois-internal/')) {
                    toBeSwallowed = true;
                } else if (error.url?.includes('ignore404')) {
                    toBeSwallowed = true;
                } else if (error.error?.link?.href?.includes('ignore404')) {
                    toBeSwallowed = true;
                }
            }
            if ((isServerError(error.status) || isNotFoundError(error.status)) && _.startsWith(error.url, 'api/whois/autocomplete')) {
                toBeSwallowed = true;
            }
            if (isServerError(error.status) && _.startsWith(error.url, 'api/dns/status')) {
                toBeSwallowed = true;
            }
        }

        if (isNotFoundError(error.status) && _.startsWith(router.url, '/textupdates/multi')) {
            toBeSwallowed = true;
        }
        if (isNotFoundError(error.status) && _.startsWith(router.url, '/fmp')) {
            toBeSwallowed = true;
        }
        if (isServerError(error.status) && _.includes(error.url, 'api/ba-apps/resources')) {
            toBeSwallowed = true;
        }
        if (_.includes(router.url, '/syncupdates')) {
            toBeSwallowed = true;
        }

        console.debug('Must be swallowed? ' + toBeSwallowed);
        return toBeSwallowed;
    };

    const redirectToLogin = () => {
        const url = location.href;
        const ssoUrl = `${properties.LOGIN_URL}?originalUrl=${encodeURIComponent(url)}`;
        console.info('Force SSO login:' + ssoUrl);
        window.location.href = ssoUrl;
    };

    const handleTransitionError = (err: HttpErrorResponse) => {
        const url = err.url ?? '';
        if (url.includes('myresources') || url.includes('wizard') || url.includes('modify') || url.includes('fmp')) {
            redirectToLogin();
        }
    };

    const showBlockUserBanner = (error: HttpErrorResponse) => {
        alertService.setGlobalError(
            error.error.errormessages.errormessage[0].text,
            'https://apps.db.ripe.net/docs/FAQ/#why-did-i-receive-an-error-201-access-denied',
            'More information',
        );
    };

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            if (!mustErrorBeSwallowed(err)) {
                switch (err.status) {
                    case 500:
                    case 502:
                    case 503:
                        void router.navigate(['error']);
                        break;
                    case 404:
                        void router.navigate(['not-found']);
                        break;
                    case 401:
                        handleTransitionError(err);
                        break;
                    case 429:
                        showBlockUserBanner(err);
                        break;
                    default:
                        break;
                }
            }
            return throwError(() => err);
        }),
    );
};
