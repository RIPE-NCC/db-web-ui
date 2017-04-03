
interface IMoreSpecificsService {
    getSpecifics(objectName: string, objectType: string): IHttpPromise<IMoreSpecificsApiResult>;
}

interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[];
}

interface IMoreSpecificResource {
    resource: string;
    status: string;
    type: string;
    netname: string;
}

class MoreSpecificsService implements IMoreSpecificsService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService, private $http: angular.IHttpService) {
    }

    public getSpecifics(objectName: string, objectType: string): IHttpPromise<IMoreSpecificsApiResult> {
        return this.$http.get("api/whois-internal/api/resources/" +
                               objectType + "/" + objectName + "/more-specifics.json");
    }
}

angular
    .module("dbWebApp")
    .service("MoreSpecificsService", MoreSpecificsService);
