interface ISyncupdatesService {
    update(rpslObject: string): angular.IHttpPromise<string>;
}

class SyncupdatesService implements ISyncupdatesService {

    public static $inject = [
        "$http",
    ];

    constructor(private $http: angular.IHttpService) {
    }

    public update(rpslObject: string): angular.IHttpPromise<string> {
            return this.$http.post("api/syncupdates", encodeURIComponent(rpslObject.trim()));
    }
}

angular
    .module("dbWebApp")
    .service("SyncupdatesService", SyncupdatesService);
