import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { MenuService } from '../menu/menu.service';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const properties = inject(PropertiesService);
    const alertService = inject(AlertsService);
    const menuService = inject(MenuService);

    const isServerError = (status: number) => status === 500;
    const isAuthorisationError = (status: number) => status === 401;
    const isForbiddenError = (status: number) => status === 403;
    const isNotFoundError = (status: number) => status === 404;

    const mustErrorBeSwallowed = (error: HttpErrorResponse) => {
        let toBeSwallowed = false;

        console.debug('ui-url:' + router.url);
        console.debug('http-status:' + error.status);
        if (error !== undefined) {
            console.debug('rest-url:' + error.url);
            if ((isServerError(error.status) || isAuthorisationError(error.status)) && error.url.endsWith('api/user/info')) {
                toBeSwallowed = true;
            }
            if (isForbiddenError(error.status) && error.url.endsWith('api/user/info')) {
                toBeSwallowed = true;
            }
            if (error.url?.includes('/rpki/roa')) {
                toBeSwallowed = true;
            }
            if (isNotFoundError(error.status)) {
                if (error.url.startsWith('api/whois-internal/')) {
                    toBeSwallowed = true;
                } else if (error.url?.includes('ignore404')) {
                    toBeSwallowed = true;
                } else if (error.error?.link?.href?.includes('ignore404')) {
                    toBeSwallowed = true;
                }
            }
            if ((isServerError(error.status) || isNotFoundError(error.status)) && error.url.startsWith('api/whois/autocomplete')) {
                toBeSwallowed = true;
            }
            if (isServerError(error.status) && error.url.startsWith('api/dns/status')) {
                toBeSwallowed = true;
            }
        }

        if (isNotFoundError(error.status) && router.url.startsWith('/textupdates/multi')) {
            toBeSwallowed = true;
        }
        if (isNotFoundError(error.status) && router.url.startsWith('/fmp')) {
            toBeSwallowed = true;
        }
        if (isServerError(error.status) && error.url.includes('api/ba-apps/resources')) {
            toBeSwallowed = true;
        }
        if (router.url.includes('/syncupdates')) {
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
            'https://apps.db.ripe.net/docs/FAQ#why-did-i-receive-an-error-201-access-denied',
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
                        menuService.isActiveResourcesMenu() ? void router.navigate(['myresources/error']) : void router.navigate(['error']);
                        break;
                    case 404:
                        menuService.isActiveResourcesMenu() ? void router.navigate(['myresources/not-found']) : void router.navigate(['not-found']);
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
