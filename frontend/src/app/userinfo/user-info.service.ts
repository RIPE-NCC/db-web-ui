import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, share, timeout } from 'rxjs/operators';
import { IUserInfoOrganisation, IUserInfoResponseData, UserInfo } from '../dropdown/org-data-type.model';

@Injectable({ providedIn: 'root' })
export class UserInfoService {
    private http = inject(HttpClient);
    private cookies = inject(CookieService);

    private userInfo: IUserInfoResponseData;
    private selectedOrganisation: IUserInfoOrganisation;
    userLoggedIn$: EventEmitter<IUserInfoResponseData>;

    constructor() {
        this.userLoggedIn$ = new EventEmitter();
    }

    public isLoggedIn(): boolean {
        return !!this.userInfo;
    }

    getLoggedInOidc() {
        this.http.get('api/user-oidc/me').subscribe((user: UserInfo) => {
            console.log(user);
        });
    }

    removeUserInfo() {
        this.userInfo = undefined;
    }

    getUserOrgsAndRoles(): Observable<IUserInfoResponseData> {
        if (this.userInfo) {
            return of(this.userInfo);
        } else {
            return this.http.get('api/whois-internal/api/user/info').pipe(
                timeout(30000),
                share(),
                map((response: IUserInfoResponseData) => {
                    this.userInfo = response;
                    this.userLoggedIn$.emit(response);
                    return this.userInfo;
                }),
                catchError((error: any) => {
                    console.error('authenticate error:' + JSON.stringify(error));
                    return throwError(error);
                }),
            );
        }
    }

    pingUserInfo(): Observable<Object> {
        return this.http.get('api/whois-internal/api/user/info');
    }

    getSelectedOrganisation(): Observable<IUserInfoOrganisation> {
        const storedSelectionId = this.getSelectedOrgFromCookie();
        return this.getUserOrgsAndRoles().pipe(
            map((userInfo: IUserInfoResponseData) => {
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
