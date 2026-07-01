import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserOidc } from './dropdown/org-data-type.model';
import { UserInfoService } from './userinfo/user-info.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard {
    private userInfoService = inject(UserInfoService);

    canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.userInfoService.getLoggedInOidc().pipe(
            map((userOidc: UserOidc) => true),
            catchError(() => {
                this.redirectToLogin(state.url);
                return of(false);
            }),
        );
    }

    private redirectToLogin(stateUrl: string) {
        window.location.href = `/db-web-ui/oauth2/authorization/keycloak?next=${window.location.origin}/db-web-ui${stateUrl}`;
    }
}
