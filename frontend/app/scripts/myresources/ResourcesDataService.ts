import IHttpPromiseCallback = angular.IHttpPromiseCallback;
class MyResourcesDataService implements IResourcesDataService {
    public static $inject = ["$http", "$log"];

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService) {
    }

    public fetchIpv4Resources(orgId: string, pageNr: number): IPromise<IPv4ResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "org-id": orgId,
            "page": pageNr,
            "type": "inetnum",
        });
    }

    public fetchIpv6Resources(orgId: string, pageNr: number): IPromise<IPv6ResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "org-id": orgId,
            "page": pageNr,
            "type": "inet6num",
        });
    }

    public fetchAsnResources(orgId: string, pageNr: number): IPromise<AsnResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "org-id": orgId,
            "page": pageNr,
            "type": "aut-num",
        });
    }

    public fetchSponsoredIpv4Resources(orgId: string, pageNr: number): IPromise<IPv4ResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "page": pageNr,
            "sponsoring-org-id": orgId,
            "type": "inetnum",
        });
    }

    public fetchSponsoredIpv6Resources(orgId: string, pageNr: number): IPromise<IPv6ResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "page": pageNr,
            "sponsoring-org-id": orgId,
            "type": "inet6num",
        });
    }

    public fetchSponsoredAsnResources(orgId: string, pageNr: number): IPromise<AsnResourcesResponse> {
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        return this.fetchResources({
            "page": pageNr,
            "sponsoring-org-id": orgId,
            "type": "aut-num",
        });
    }

    private fetchResources(params: {}): IPromise<any> {
        return this.$http({
            method: "GET",
            params,
            timeout: 10000,
            url: "api/whois-internal/api/resources.json",
        });
    }

}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
