import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

class UserInfoService {

    public static $inject = ["$log", "$http", "$q", "$cookies"];

    private userInfo: IUserInfoResponseData;
    private selectedOrganisation: IUserInfoOrganisation;
    private deferred: ng.IDeferred<IUserInfoResponseData>;

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService,
                private $q: ng.IQService,
                private $cookies: angular.cookies.ICookiesService) {
    }

    public getUserOrgsAndRoles(): IHttpPromise<IUserInfoResponseData> {
        if (!this.deferred) {
            this.deferred = this.$q.defer();

            if (this.userInfo) {
                this.deferred.resolve(this.userInfo);
            } else {
                this.deferred.resolve(
                    this.$http({
                        method: "GET",
                        timeout: 10000,
                        url: "api/whois-internal/api/user/info",
                    }).then((response: IHttpPromiseCallbackArg<IUserInfoResponseData>) => {
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

    public getSelectedOrganisation(): IPromise<IUserInfoOrganisation> {
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
            selected.membershipId != null ? selected.membershipId : "org:" + selected.orgObjectId,
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
