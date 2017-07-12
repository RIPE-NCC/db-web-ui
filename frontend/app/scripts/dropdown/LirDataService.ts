import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

class LirDataService implements ILirDataService {

    public static $inject = ["$log", "$http", "$q"];

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }

    public getOrgs(): IPromise<IOrganisationModel[]> {
        return this.$q.all([
            this.getLirData(),
            this.getEndUserData(),
        ]).then((response: IHttpPromiseCallbackArg<IOrganisationModel[]>) => {
            const lirs: ILirModel[] = response[0].data.response.results;
            const lirOrgs: IOrganisationModel[] = lirs.map((lir) => {
                return {
                    displayName: (lir.organisationname ? lir.organisationname + " " + lir.regId : lir.regId),
                    memberId: lir.membershipId.toString(),
                    orgId: lir.orgId,
                    orgName: lir.organisationname,
                    regId: lir.regId,
                } as IOrganisationModel;
            });
            const orgs: IDbOrg[] = response[1].data;
            const orgOrgs: IOrganisationModel[] = orgs.map((org) => {
                return {
                    displayName: org.name,
                    memberId: "org:" + org.id,
                    orgId: org.id,
                    orgName: org.name,
                    regId: org.id,
                } as IOrganisationModel;
            });
            const lirNOrgs: IOrganisationModel[] = lirOrgs.concat(orgOrgs);
            return lirNOrgs.sort((a: IOrganisationModel, b: IOrganisationModel): number => {
                return a.displayName.localeCompare(b.displayName);
            });
        });
    }

    private getLirData(): ng.IPromise<any[]> {
        return this.$http.get("api/ba-apps/lirs");
    }

    private getEndUserData(): ng.IPromise<any[]> {
        return this.$http.get("api/ba-apps/organisations");
    }

}

angular.module("dbWebApp").service("LirDataService", LirDataService);
