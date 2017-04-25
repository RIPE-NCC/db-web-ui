import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

class OrgDropDownDataService implements IOrgDropDownDataService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        // request LIR data
        return this.$http.get("api/ba-apps/lirs").then(
            (response: IHttpPromiseCallbackArg<any>) => {
                const lirs: Lir[] = response.data.response.results;
                const lirOrgs: Organisation[] = lirs.map((lir) => {
                    return {
                        displayName: (lir.organisationname ? lir.organisationname + " " + lir.regId : lir.regId),
                        memberId: lir.membershipId.toString(),
                        orgId: lir.orgId,
                        orgName: lir.organisationname,
                        regId: lir.regId,
                    } as Organisation;
                });
                return lirOrgs.sort((a: Organisation, b: Organisation): number => {
                    return a.displayName.localeCompare(b.displayName);
                });
            },
        );
    }

}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataService);
