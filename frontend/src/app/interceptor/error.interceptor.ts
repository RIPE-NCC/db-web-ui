import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import * as _ from "lodash";
import {PropertiesService} from "../properties.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router,
                private properties: PropertiesService) {
    }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    if (!this.mustErrorBeSwallowed(err)) {
                        switch (err.status) {
                            case 500: {
                                this.router.navigate(["error"]);
                                break;
                            }
                            case 503: {
                                this.router.navigate(["error"]);
                                break;
                            }
                            case 502: {
                                this.router.navigate(["error"]);
                                break;
                            }
                            case 404: {
                                this.router.navigate(["not-found"]);
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
                            default: {
                                break;
                            }
                        }
                    }
                    return throwError(err);
                }));
    }

    private handleTransitionError(err: HttpErrorResponse) {
        if (err.url.indexOf("myresources") > -1
            || err.url.indexOf("wizard") > -1
            || err.url.indexOf("modify") > -1
            || err.url.indexOf("fmp") > -1) {
            this.redirectToLogin();
        }
    }

    private redirectToLogin() {
        const url = location.href;
        const crowdUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(url)}`;
        console.info("Force crowd login:" + crowdUrl);
        window.location.href = crowdUrl;
    };

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

        console.debug("ui-url:" + this.router.url);
        console.debug("http-status:" + error.status);
        if (!_.isUndefined(error)) {
            console.debug("rest-url:" + error.url);
            if ((this.isServerError(error.status) || this.isAuthorisationError(error.status)) && _.endsWith(error.url, "api/user/info")) {
                toBeSwallowed = true;
            }
            if (this.isForbiddenError(error.status) && _.endsWith(error.url, "api/user/info")) {
                toBeSwallowed = true;
            }
            if (this.isNotFoundError(error.status)) {
                if (_.startsWith(error.url, "api/whois-internal/")) {
                    toBeSwallowed = true;
                } else if (error.url && error.url.indexOf("ignore404") > -1) {
                    toBeSwallowed = true;
                // just for ie 11
                } else if (error.error && error.error.link && error.error.link.href && error.error.link.href.indexOf("ignore404") > -1) {
                    toBeSwallowed = true;
                }
            }
            // TODO - We can remove the following code after WhoIs 1.86 deployment
            // Code added to prevent 500 exploding to the user during autocomplete.
            // The real way to fix it is in Whois, but we"re waiting it to be deployed.
            // NOTE..........
            // Added code to stop parent lookups from forcing nav to 404.html if they aren't found.
            if ((this.isServerError(error.status) || this.isNotFoundError(error.status)) && _.startsWith(error.url, "api/whois/autocomplete")) {
                toBeSwallowed = true;
            }
            if (this.isServerError(error.status) && _.startsWith(error.url, "api/dns/status")) {
                toBeSwallowed = true;
            }
        }

        if (this.isNotFoundError(error.status) && _.startsWith(this.router.url, "/textupdates/multi")) {
            toBeSwallowed = true;
        }

        if (this.isNotFoundError(error.status) && _.startsWith(this.router.url, "/fmp")) {
            toBeSwallowed = true;
        }

        if (this.isServerError(error.status) && _.includes(error.url, "api/ba-apps/resources")) {
            toBeSwallowed = true;
        }

        console.debug("Must be swallowed? " + toBeSwallowed);

        return toBeSwallowed;
    }
}
