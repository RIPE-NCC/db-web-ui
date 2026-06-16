import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserOidc } from './dropdown/org-data-type.model';
import { UserInfoService } from './userinfo/user-info.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard {
    private userInfoService = inject(UserInfoService);

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.userInfoService.getLoggedInOidc().pipe(
            map((userOidc: UserOidc) => true),
            catchError(() => {
                this.redirectToLogin();
                return of(false);
            }),
        );
    }

    private redirectToLogin() {
        window.location.href = `/db-web-ui/oauth2/authorization/keycloak?next=${window.location.href}`;
    }
}
