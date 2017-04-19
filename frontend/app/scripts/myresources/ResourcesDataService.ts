import IHttpPromiseCallback = angular.IHttpPromiseCallback;

class ResourcesDataService implements IResourcesDataService {

    public static $inject = ["$http", "$log"];

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService) {
    }

    public fetchParentResources(resource: IResourceModel, org: string): IPromise<string[]> {
        if (!resource || !resource.resource || !resource.type) {
            this.$log.error("Not a resource", resource);
            throw new TypeError("ResourcesDataService.fetchParentResource failed: not a resource");
        }
        const type = resource.type;
        const key = resource.resource;
        const params = {
            type,
            key,
            org,
        };
        return this.$http({
            method: "GET",
            params,
            timeout: 10000,
            url: "api/whois/hierarchy/parents-of",
        });
    }

    public fetchIpv4Resources(orgId: string): IPromise<IPv4ResourcesResponse> {
        return this.fetchResources({
            "org-id": orgId,
            "type": "inetnum",
        });
    }

    public fetchIpv6Resources(orgId: string): IPromise<IPv6ResourcesResponse> {
        return this.fetchResources({
            "org-id": orgId,
            "type": "inet6num",
        });
    }

    public fetchAsnResources(orgId: string): IPromise<AsnResourcesResponse> {
        return this.fetchResources({
            "org-id": orgId,
            "type": "aut-num",
        });
    }

    public fetchSponsoredIpv4Resources(orgId: string): IPromise<IPv4ResourcesResponse> {
        return this.fetchResources({
            "sponsoring-org-id": orgId,
            "type": "inetnum",
        });
    }

    public fetchSponsoredIpv6Resources(orgId: string): IPromise<IPv6ResourcesResponse> {
        return this.fetchResources({
            "sponsoring-org-id": orgId,
            "type": "inet6num",
        });
    }

    public fetchSponsoredAsnResources(orgId: string): IPromise<AsnResourcesResponse> {
        return this.fetchResources({
            "sponsoring-org-id": orgId,
            "type": "aut-num",
        });
    }

    private fetchResources(params: {}): IPromise<any> {
        return this.$http({
            method: "GET",
            params,
            timeout: 10000,
            url: "api/whois-internal/api/resources",
        });
    }

}

angular
    .module("dbWebApp")
    .service("ResourcesDataService", ResourcesDataService);