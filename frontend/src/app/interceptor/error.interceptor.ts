import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private router = inject(Router);
    private properties = inject(PropertiesService);
    private alertService = inject(AlertsService);

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                if (!this.mustErrorBeSwallowed(err)) {
                    switch (err.status) {
                        case 500: {
                            void this.router.navigate(['error']);
                            break;
                        }
                        case 503: {
                            void this.router.navigate(['error']);
                            break;
                        }
                        case 502: {
                            void this.router.navigate(['error']);
                            break;
                        }
                        case 404: {
                            void this.router.navigate(['not-found']);
                            break;
                        }
                        case 403: {
                            // TODO forbiddenError ?
                            break;
                        }
                        case 401: {
                            this.handleTransitionError(err);
                            break;
                        }
                        case 429: {
                            this.showBlockUserBanner(err);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
                return throwError(() => err);
            }),
        );
    }

    private handleTransitionError(err: HttpErrorResponse) {
        if (err.url.indexOf('myresources') > -1 || err.url.indexOf('wizard') > -1 || err.url.indexOf('modify') > -1 || err.url.indexOf('fmp') > -1) {
            this.redirectToLogin();
        }
    }

    private redirectToLogin() {
        const url = location.href;
        const ssoUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(url)}`;
        console.info('Force SSO login:' + ssoUrl);
        window.location.href = ssoUrl;
    }

    private isServerError(status: number) {
        return status === 500;
    }

    private isAuthorisationError(status: number) {
        return status === 401;
    }

    private isForbiddenError(status: number) {
        return status === 403;
    }

    private isNotFoundError(status: number) {
        return status === 404;
    }

    private mustErrorBeSwallowed = (error: HttpErrorResponse) => {
        let toBeSwallowed = false;

        console.debug('ui-url:' + this.router.url);
        console.debug('http-status:' + error.status);
        if (!_.isUndefined(error)) {
            console.debug('rest-url:' + error.url);
            if ((this.isServerError(error.status) || this.isAuthorisationError(error.status)) && _.endsWith(error.url, 'api/user/info')) {
                toBeSwallowed = true;
            }
            if (this.isForbiddenError(error.status) && _.endsWith(error.url, 'api/user/info')) {
                toBeSwallowed = true;
            }
            if (error.url.indexOf('/rpki/roa') > -1) {
                toBeSwallowed = true;
            }
            if (this.isNotFoundError(error.status)) {
                if (_.startsWith(error.url, 'api/whois-internal/')) {
                    toBeSwallowed = true;
                } else if (error.url && error.url.indexOf('ignore404') > -1) {
                    toBeSwallowed = true;
                    // just for ie 11
                } else if (error.error && error.error.link && error.error.link.href && error.error.link.href.indexOf('ignore404') > -1) {
                    toBeSwallowed = true;
                }
            }
            // TODO - We can remove the following code after WhoIs 1.86 deployment
            // Code added to prevent 500 exploding to the user during autocomplete.
            // The real way to fix it is in Whois, but we"re waiting it to be deployed.
            // NOTE..........
            // Added code to stop parent lookups from forcing nav to 404.html if they aren't found.
            if ((this.isServerError(error.status) || this.isNotFoundError(error.status)) && _.startsWith(error.url, 'api/whois/autocomplete')) {
                toBeSwallowed = true;
            }
            if (this.isServerError(error.status) && _.startsWith(error.url, 'api/dns/status')) {
                toBeSwallowed = true;
            }
        }

        if (this.isNotFoundError(error.status) && _.startsWith(this.router.url, '/textupdates/multi')) {
            toBeSwallowed = true;
        }

        if (this.isNotFoundError(error.status) && _.startsWith(this.router.url, '/fmp')) {
            toBeSwallowed = true;
        }

        if (this.isServerError(error.status) && _.includes(error.url, 'api/ba-apps/resources')) {
            toBeSwallowed = true;
        }

        if (_.includes(this.router.url, '/syncupdates')) {
            toBeSwallowed = true;
        }

        console.debug('Must be swallowed? ' + toBeSwallowed);

        return toBeSwallowed;
    };

    private showBlockUserBanner(error: HttpErrorResponse) {
        this.alertService.setGlobalError(
            error.error.errormessages.errormessage[0].text,
            'https://apps.db.ripe.net/docs/FAQ/#why-did-i-receive-an-error-201-access-denied',
            'More information',
        );
    }
}
