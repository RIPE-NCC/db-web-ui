import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;

const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    static $inject = ['$log', '$http', '$q'];

    getOrgs(): IPromise<Organisation[]> {
        const ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
        const os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

        const combined: IHttpPromise<{data: any}[]> = this.$q.all([ls, os]);

        return combined.then((o) => {
            let lirs: Lir[] = o[0].data.response.results;
            let lirOrgs: Organisation[] = lirs.map((lir) => {
                return {id: lir.orgId, name: lir.organisationName + " " + lir.regId} as Organisation;
            });
            return lirOrgs.concat(o[1].data);
        });
    }

    constructor(private $log: angular.ILogService,
                private $http: ng.IHttpService,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
