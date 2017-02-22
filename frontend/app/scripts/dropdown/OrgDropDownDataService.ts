import IHttpPromise = angular.IHttpPromise;

const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    static $inject = ['$log', '$http', '$q'];

    loadOrgs(callback: (x: Organisation[]) => void): void {
        let ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
        let os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

        let combined: IHttpPromise<{data: any}[]> = this.$q.all([ls, os]);
        combined.then((o) => {
            let lirs: Lir[] = o[0].data.response.results;
            let lirOrgs: Organisation[] = lirs.map((lir) => {
                return {id: lir.orgId, name: lir.organisationName + " " + lir.regId} as Organisation;
            });
            let orgs: Organisation[] = lirOrgs.concat(o[1].data);
            callback(orgs);
        }).catch((e) => {
            console.error("Couldn't load organisations", e);
        });
    }

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
