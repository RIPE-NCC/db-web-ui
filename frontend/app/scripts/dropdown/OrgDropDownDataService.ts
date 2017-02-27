import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataService implements IOrgDropDownDataService {

    public static $inject = ["$log", "$http", "$q"];

    public getOrgs(): IPromise<Organisation[]> {
        // request LIR and organisation data in parallel
        const ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
        const os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

        const combined: IHttpPromise<{data: any}[]> = this.$q.all([ls, os]);

        return combined.then((o) => {
            let lirs: Lir[] = [];
            try {
                lirs = o[0].data.response.results;
            } catch (e) {  // just swallow it
            }

            // LIR response has different structure and contains more data
            // than we need, so we map it here
            const lirOrgs: Organisation[] = lirs.map((lir) => {
                return {
                    displayName: (lir.organisationName ? lir.organisationName + " " + lir.regId : lir.regId),
                    memberId: lir.membershipId,
                    orgId: lir.orgId,
                    orgName: lir.organisationName,
                    regId: lir.regId,
                } as Organisation;
            });
            let organisations: Organisation[] = [];
            try {
                const dbOrgs: DbOrg[] = o[1].data;
                organisations = dbOrgs.map((org) => {
                    return {
                        displayName: org.name,
                        memberId: null,
                        orgId: org.id,
                        orgName: org.name,
                        regId: null,
                    } as Organisation;
                });
            } catch (e) {
                // todo
            }

            // TODO: sort the list now that's it's concatenated
            return lirOrgs.concat(organisations);
        });
    }

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataService);
