import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IUserInfoResponseData } from './dropdown/org-data-type.model';
import { PropertiesService } from './properties.service';
import { UserInfoService } from './userinfo/user-info.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private userInfoService: UserInfoService, private properties: PropertiesService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.userInfoService.getUserOrgsAndRoles().pipe(
            map((userInfo: IUserInfoResponseData) => true),
            catchError(() => {
                this.redirectToLogin(state.url);
                return of(false);
            }),
        );
    }

    private redirectToLogin(originalPath: string) {
        const url = window.location.origin + `/db-web-ui${originalPath}`;
        const ssoUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(url)}`;
        console.info('Force SSO login:' + ssoUrl);
        window.location.href = ssoUrl;
    }
}
