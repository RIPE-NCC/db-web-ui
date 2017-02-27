import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    static $inject = ['$log', '$http', '$q'];

    getOrgs(): IPromise<Organisation[]> {
        // request LIR and organisation data in parallel
        const ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
        const os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

        const notEmpty = (s: string) => angular.isString(s) && s.length > 0;
        const combined: IHttpPromise<{data: any}[]> = this.$q.all([ls, os]);

        return combined.then((o) => {
            let lirs: Lir[] = [];
            try {
                lirs = o[0].data.response.results
            } catch (e) {  // just swallow it
            }

            // LIR response has different structure and contains more data
            // than we need, so we map it here
            const lirOrgs: Organisation[] = lirs.map((lir) => {
                let orgName = notEmpty(lir.organisationName) ?
                    (lir.organisationName + " " + lir.regId) :
                    lir.regId;

                return {
                    orgId: lir.orgId,
                    name: orgName,
                    activeOrg: lir.membershipId.toString()
                } as Organisation;
            });
            let organisations: Organisation[] = [];
            try {
                const dbOrgs: DbOrg[] = o[1].data;
                organisations = dbOrgs.map((org) => {
                    return {orgId: org.id, name: org.name, activeOrg: "org:" + org.id} as Organisation;
                });
            } catch (e) {
            }

            return lirOrgs.concat(organisations);
        });
    }

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
