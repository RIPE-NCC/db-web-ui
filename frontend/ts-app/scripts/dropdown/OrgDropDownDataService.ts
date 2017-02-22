const CONTEXT_PATH: string = "/db-web-ui";

class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    static $inject = ['$log', '$resource', '$q'];

    loadOrgs(callback: (x: Organisation[]) => void): void {
        let ls = this.$resource(CONTEXT_PATH + "/api/ba-apps/lirs").get();
        let os = this.$resource(CONTEXT_PATH + "/api/ba-apps/organisations").query();

        this.$q.all([ls.$promise, os.$promise]).then(function (o) {
            let lirs: Lir[] = o[0].response.results;
            let lirOrgs: Organisation[] = lirs.map((lir) => {
                return {id: lir.orgId, name: lir.organisationName + " " + lir.regId} as Organisation;
            });
            let orgs: Organisation[] = lirOrgs.concat(o[1]);
            callback(orgs);
        })
    }

    constructor(private $log: angular.ILogService,
                private $resource: ng.resource.IResource,
                private $q: ng.IQService) {
    }
}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
