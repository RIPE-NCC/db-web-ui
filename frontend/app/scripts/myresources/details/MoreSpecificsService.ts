
interface IMoreSpecificsDataService {
    getSpecifics(objectName: string, objectType: string, pageNr: number): IHttpPromise<IMoreSpecificsApiResult>;
}

interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[];
    resourcesSize: number;
}

interface IMoreSpecificResource {
    resource: string;
    status: string;
    type: string;
    netname: string;
}

class MoreSpecificsDataService implements IMoreSpecificsDataService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService, private $http: angular.IHttpService) {
    }

    public getSpecifics(objectName: string, objectType: string, pageNr: number): IHttpPromise<IMoreSpecificsApiResult> {
        const url = "api/whois-internal/api/resources/" + objectType + "/" + objectName + "/more-specifics.json";
        const params = {
            page: pageNr,
        };
        return this.$http({
            method: "GET",
            params,
            url,
        });
    }
}

angular
    .module("dbWebApp")
    .service("MoreSpecificsService", MoreSpecificsDataService);
