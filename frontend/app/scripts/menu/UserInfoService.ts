class UserInfoService {

    public static $inject = ["$log", "$http", "$q", "$cookies"];

    private userInfo: IUserInfoResponseData;
    private loggedInUser: IUserInfo;
    private selectedOrganisation: IUserInfoOrganisation;
    private deferred: ng.IDeferred<IUserInfoResponseData>;
    private deferredUserInfo: ng.IDeferred<IUserInfo>;

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService,
                private $q: ng.IQService,
                private $cookies: angular.cookies.ICookiesService) {
    }

    public getLoggedInUser(): ng.IPromise<IUserInfo> {
        if (!this.deferredUserInfo) {
            this.deferredUserInfo = this.$q.defer();

            if (this.loggedInUser) {
                this.deferredUserInfo.resolve(this.loggedInUser);
            } else {
                this.deferredUserInfo.resolve(
                    this.$http({
                        method: "GET",
                        url: "api/user/info",
                    }).then((response: ng.IHttpPromiseCallbackArg<IUserInfo>) => {
                        this.loggedInUser = response.data;
                        return this.loggedInUser;
                    }),
                );
            }
        }
        return this.deferredUserInfo.promise;
    }

    public getUserOrgsAndRoles(): ng.IPromise<IUserInfoResponseData> {
        if (!this.deferred) {
            this.deferred = this.$q.defer();

            if (this.userInfo) {
                this.deferred.resolve(this.userInfo);
            } else {
                this.deferred.resolve(
                    this.$http({
                        method: "GET",
                        timeout: 30000,
                        url: "api/whois-internal/api/user/info",
                    }).then((response: ng.IHttpPromiseCallbackArg<IUserInfoResponseData>) => {
                        this.userInfo = response.data;
                        return this.userInfo;
                    }),
                );
            }
        }
        return this.deferred.promise;
    }

    public clear(): void {
        this.deferred = null;
    }

    public getSelectedOrganisation(): ng.IPromise<IUserInfoOrganisation> {
        const storedSelectionId = this.getSelectedOrgFromCookie();
        return this.getUserOrgsAndRoles().then((userInfo: IUserInfoResponseData) => {
            if (storedSelectionId) {
                if (angular.isArray(userInfo.organisations)) {
                    for (const org of userInfo.organisations) {
                        if ("org:" + org.orgObjectId === storedSelectionId.toString()) {
                            this.selectedOrganisation = org;
                            break;
                        }
                    }
                }
                if (angular.isArray(userInfo.members)) {
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
        });
    }

    public setSelectedOrganisation(selected: any) {
        this.selectedOrganisation = selected;
        this.$cookies.put("activeMembershipId",
            selected.membershipId !== null ? selected.membershipId : "org:" + selected.orgObjectId,
            {path: "/", domain: ".ripe.net", secure: true});
        localStorage.removeItem("selectedOrg");
    }

    private getSelectedOrgFromCookie(): string {
        const cookie = this.$cookies.get("activeMembershipId");
        // cookies were implemented after localStorage,
        // just to protect that user doesn't lost selected organization after deploy
        return cookie ? cookie : localStorage.getItem("selectedLir");
    }
}

angular
    .module("dbWebApp")
    .service("UserInfoService", UserInfoService);
