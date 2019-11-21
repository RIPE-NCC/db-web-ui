import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {UserInfoService} from "./userinfo/user-info.service";
import {IUserInfo} from "./dropdown/org-data-type.model";
import {PropertiesService} from "./properties.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private userInfoService: UserInfoService,
                private properties: PropertiesService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.userInfoService.getLoggedInUser()
            .pipe(
                map((userInfo: IUserInfo) => true),
                catchError(error => {
                        this.redirectToLogin(state.url);
                        return of(false);
                    }
                )
            );
    }

    private redirectToLogin(originalPath: string) {
        const url = window.location.origin + `/db-web-ui/${originalPath}`;
        const crowdUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(url)}`;
        console.info("Force crowd login:" + crowdUrl);
        window.location.href = crowdUrl;
    };

}
