class UserInfoService {

    public static $inject = ["$log", "$http", "$q", "$cookies"];

    private userInfo: IUserInfoResponseData;
    private selectedOrganisation: IUserInfoOrganisation;

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService,
                private $q: ng.IQService,
                private $cookies: angular.cookies.ICookiesService) {
    }

    public getUserOrgsAndRoles(): IHttpPromise<IUserInfoResponseData> {
        if (this.userInfo) {
            return this.$q.resolve(this.userInfo);
        }
        return this.$http({
            method: "GET",
            timeout: 10000,
            url: "api/whois-internal/api/user/info",
        }).then((response: IHttpPromiseCallbackArg<IUserInfoResponseData>) => {
            this.userInfo = response.data;
            return this.userInfo;
        });
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
            if (!this.selectedOrganisation && this.userInfo.members && this.userInfo.members.length ) {
                this.selectedOrganisation = this.userInfo.members[0];
            }
            if (!this.selectedOrganisation && this.userInfo.organisations && this.userInfo.organisations.length ) {
                this.selectedOrganisation = this.userInfo.organisations[0];
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
    .service("UserInfoService2", UserInfoService);
