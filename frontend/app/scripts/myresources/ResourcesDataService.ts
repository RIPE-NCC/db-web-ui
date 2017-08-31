
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

    public fetchResource(objectName: string, type: string): IPromise<IMoreSpecificsApiResult> {
        const url = ["api/whois-internal/api/resources/", type, "/", objectName].join("");
        return this.$http({
            method: "GET",
            url,
        });
    }

    public fetchIpv4Resource(objectName: string): IPromise<IPv4ResourcesResponse> {
        return this.$http({
            method: "GET",
            url: "api/whois-internal/api/resources/inetnum/" + objectName,
        });
    }

    public fetchIpv6Resource(objectName: string): IPromise<IPv6ResourcesResponse> {
        return this.$http({
            method: "GET",
            url: "api/whois-internal/api/resources/inet6num/" + objectName,
        });
    }

    public fetchResources(orgId: string, resource: string, sponsored: boolean): IPromise<any> {
        const params = {};
        if (sponsored) {
            params["sponsoring-org-id"] = orgId;
        } else {
            params["org-id"] = orgId;
        }
        params["type"] = resource;
        return this.$http({
            headers: {
                "Content-type": "application/json",
            },
            method: "GET",
            params,
            timeout: 30000,
            url: "api/whois-internal/api/resources",
        });
    }

    public fetchTicketsAndDates(orgId: string, resource: string): IPromise<IResourceTickets> {
        return this.$http({
            method: "GET",
            url: "api/ba-apps/resources/" + orgId + "/" + resource,
        });
    }

}

angular
    .module("dbWebApp")
    .service("ResourcesDataService", ResourcesDataService);
