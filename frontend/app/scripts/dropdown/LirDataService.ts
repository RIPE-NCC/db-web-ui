import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

class LirDataService implements ILirDataService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService) {
    }

    public getOrgs(): IPromise<IOrganisationModel[]> {
        // request LIR data
        return this.$http.get("api/ba-apps/lirs").then(
            (response: IHttpPromiseCallbackArg<any>) => {
                const lirs: ILirModel[] = response.data.response.results;
                const lirOrgs: IOrganisationModel[] = lirs.map((lir) => {
                    return {
                        displayName: lir.organisationname ? lir.organisationname + " " + lir.regId : lir.regId,
                        memberId: lir.membershipId.toString(),
                        orgId: lir.orgId,
                        orgName: lir.organisationname,
                        regId: lir.regId,
                    } as IOrganisationModel;
                });
                return lirOrgs.sort((a: IOrganisationModel, b: IOrganisationModel): number => {
                    return a.displayName.localeCompare(b.displayName);
                });
            },
        );
    }

}

angular.module("dbWebApp").service("LirDataService", LirDataService);
