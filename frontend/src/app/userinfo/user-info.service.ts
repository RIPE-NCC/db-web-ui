import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {catchError, map, timeout} from "rxjs/operators";
import {Observable, of, throwError} from "rxjs";
import * as _ from "lodash";
import {IUserInfo, IUserInfoOrganisation, IUserInfoResponseData} from "../dropdown/org-data-type.model";

@Injectable()
export class UserInfoService {

    private userInfo: IUserInfoResponseData;
    private loggedInUser: IUserInfo;
    private selectedOrganisation: IUserInfoOrganisation;
    public userLoggedIn$: EventEmitter<IUserInfoResponseData>;
    public alreadyWaitingResponse: boolean = false;

    constructor(private http: HttpClient,
                private cookies: CookieService) {
        this.userLoggedIn$ = new EventEmitter();
    }

    public isLogedIn(): boolean {
        return !_.isUndefined(this.loggedInUser) || !_.isUndefined(this.userInfo);
    }

    public getLoggedInUser(): Observable<IUserInfo> {
        if (this.loggedInUser) {
            return of(this.loggedInUser);
        } else {
            return this.http.get("api/user/info")
                .pipe(
                    map((response: IUserInfo) => {
                        this.loggedInUser = response;
                        return this.loggedInUser;
                    }),
                    catchError((error: any) => {
                        console.error("authenticate error:" + JSON.stringify(error));
                        return throwError(error);
                    }));
        }
    }

    public getUserOrgsAndRoles(): Observable<IUserInfoResponseData> {
        if (this.userInfo || this.alreadyWaitingResponse) {
            return of(this.userInfo);
        } else {
            this.alreadyWaitingResponse = true;
            return this.http.get("api/whois-internal/api/user/info")
                .pipe(
                    timeout(30000),
                    map((response: IUserInfoResponseData) => {
                        this.alreadyWaitingResponse = false;
                        this.userInfo = response;
                        this.userLoggedIn$.emit(response);
                        return this.userInfo;
                    }),
                    catchError((error: any, caught: Observable<any>) => {
                        this.alreadyWaitingResponse = false;
                        console.error("authenticate error:" + JSON.stringify(error));
                        return throwError(error);
                    }));
        }
    }

    public getSelectedOrganisation(): Observable<IUserInfoOrganisation> {
        const storedSelectionId = this.getSelectedOrgFromCookie();
        return this.getUserOrgsAndRoles()
            .pipe(
                map((userInfo: IUserInfoResponseData) => {
                    if (storedSelectionId) {
                        if (_.isArray(userInfo.organisations)) {
                            for (const org of userInfo.organisations) {
                                if ("org:" + org.orgObjectId === storedSelectionId.toString()) {
                                    this.selectedOrganisation = org;
                                    break;
                                }
                            }
                        }
                        if (_.isArray(userInfo.members)) {
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
            }));
    }

    public setSelectedOrganisation(selected: any) {
        this.selectedOrganisation = selected;
        this.cookies.set("activeMembershipId",
            selected.membershipId !== undefined ? selected.membershipId : "org:" + selected.orgObjectId, 1,
            "/", ".ripe.net", true);
        localStorage.removeItem("selectedOrg");
    }

    private getSelectedOrgFromCookie(): string {
        return this.cookies.get("activeMembershipId");
    }
}
