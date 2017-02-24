import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    static $inject = ['$log', '$http', '$q'];

    getOrgs(): IPromise<Organisation[]> {
        // request LIR and organisation data in parallel
        const ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
        const os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

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
                return {id: lir.orgId, name: lir.organisationName + " " + lir.regId} as Organisation;
            });
            let dbOrgs = [];
            try {
                dbOrgs = o[1].data;
            } catch (e) {
            }

            return lirOrgs.concat(dbOrgs);
        });
    }

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
