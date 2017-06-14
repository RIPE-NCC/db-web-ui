interface IMoreSpecificsDataService {
    getSpecifics(objectName: string,
                 objectType: string, pageNr: number, filter: string): IHttpPromise<IMoreSpecificsApiResult>;
}

interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[];
    totalNumberOfResources: number;
    filteredSize: number;
}

interface IMoreSpecificResource {
    netname: string;
    resource: string;
    status: string;
    type: string;
    usage: IUsage;
}

class MoreSpecificsDataService implements IMoreSpecificsDataService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService, private $http: angular.IHttpService) {
    }

    public getSpecifics(objectName: string,
                        objectType: string,
                        page: number,
                        filter: string): IHttpPromise<IMoreSpecificsApiResult> {

        if (!objectType) {
            throw new TypeError("objectType is empty. more-specifics not available");
        }
        if (!objectName) {
            throw new TypeError("objectName is empty. more-specifics not available");
        }
        const url = "api/whois-internal/api/resources/" + objectType  + "/" + objectName + "/more-specifics.json";

        filter = filter ? filter.replace(/\s/g, "") : "";
        const params = {
            filter,
            page,
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
