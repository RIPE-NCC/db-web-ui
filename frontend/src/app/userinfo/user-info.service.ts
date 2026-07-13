import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, share, tap, timeout } from 'rxjs/operators';
import { IUserInfoOrganisation, UserOidc, UserOrgsAndRegistrations } from '../dropdown/org-data-type.model';

@Injectable({ providedIn: 'root' })
export class UserInfoService {
    private http = inject(HttpClient);
    private cookies = inject(CookieService);

    private userInfo: UserOrgsAndRegistrations;
    private selectedOrganisation: IUserInfoOrganisation;
    userOrgsAndRoles$: EventEmitter<UserOrgsAndRegistrations>;

    user = signal<UserOidc | null>(null);

    isLoggedIn = computed(() => !!this.user());

    constructor() {
        this.userOrgsAndRoles$ = new EventEmitter();
    }

    getLoggedInOidc() {
        return this.http.get('api/user-oidc/me').pipe(
            timeout(30000),
            share(),
            tap((user: UserOidc) => this.user.set(user)),
            catchError((error: any) => {
                console.error('authenticate error:' + JSON.stringify(error));
                if (error.status === 401) {
                    // User is not logged in
                    this.user.set(null);
                }
                return throwError(() => error);
            }),
        );
    }

    removeUserInfo() {
        this.userInfo = undefined;
    }

    isUserLoggedIn() {
        return this.http.get('api/user-oidc/info');
    }

    getUserOrgsAndRoles(): Observable<UserOrgsAndRegistrations> {
        if (this.userInfo) {
            return of(this.userInfo);
        } else {
            //send access token
            return this.http.get('api/whois-internal/api/user/info').pipe(
                timeout(30000),
                share(),
                map((response: UserOrgsAndRegistrations) => {
                    this.userInfo = response;
                    this.userOrgsAndRoles$.emit(response);
                    return this.userInfo;
                }),
                catchError((error: any) => {
                    console.error('authenticate error:' + JSON.stringify(error));
                    return throwError(error);
                }),
            );
        }
    }

    getSelectedOrganisation(): Observable<IUserInfoOrganisation> {
        const storedSelectionId = this.getSelectedOrgFromCookie();
        return this.getUserOrgsAndRoles().pipe(
            map((userInfo: UserOrgsAndRegistrations) => {
                if (storedSelectionId) {
                    if (Array.isArray(userInfo.organisations)) {
                        for (const org of userInfo.organisations) {
                            if ('org:' + org.orgObjectId === storedSelectionId.toString()) {
                                this.selectedOrganisation = org;
                                break;
                            }
                        }
                    }
                    if (Array.isArray(userInfo.members)) {
                        for (const org of userInfo.members) {
                            if (org.membershipId.toString() === storedSelectionId.toString()) {
                                this.selectedOrganisation = org;
                                break;
                            }
                        }
                    }
                }
                if (!this.selectedOrganisation) {
                    let orgs: IUserInfoOrganisation[] = [];
                    if (userInfo.organisations) {
                        orgs = orgs.concat(userInfo.organisations);
                    }
                    if (userInfo.members) {
                        orgs = orgs.concat(userInfo.members);
                    }
                    orgs.sort((o1, o2) => {
                        return o1.organisationName.localeCompare(o2.organisationName);
                    });
                    this.selectedOrganisation = orgs[0];
                }
                return this.selectedOrganisation;
            }),
        );
    }

    setSelectedOrganisation(selected: any) {
        this.selectedOrganisation = selected;
        this.cookies.set(
            'activeMembershipId',
            selected.membershipId !== undefined ? selected.membershipId : 'org:' + selected.orgObjectId,
            1,
            '/',
            '.ripe.net',
            true,
        );
        localStorage.removeItem('selectedOrg');
    }

    private getSelectedOrgFromCookie(): string {
        return this.cookies.get('activeMembershipId');
    }
}
