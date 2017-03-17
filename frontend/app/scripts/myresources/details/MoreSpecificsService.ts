
interface IMoreSpecificsService {
    getSpecifics(objectName: String): IHttpPromise<IMoreSpecificsApiResult>;
}

interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[]
}

interface IMoreSpecificResource {
    resource: String,
    status: String,
    type: String,
    netname: String
}

class MoreSpecificsService implements IMoreSpecificsService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService, private $http: angular.IHttpService) {
    }

    public getSpecifics(objectName: String): IHttpPromise<IMoreSpecificsApiResult> {
        return this.$http.get("api/whois-internal/api/inetnum/" + objectName + "/more-specifics.json");
    }
}

angular
    .module("dbWebApp")
    .service("MoreSpecificsService", MoreSpecificsService);
