class ResourcesDataService implements IResourcesDataService {

    public static $inject = ["$http", "$log"];

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService) {
    }

    public fetchParentResources(resource: IResourceModel, org: string): ng.IPromise<ng.IHttpResponse<string[]>> {
        if (!resource || !resource.resource || !resource.type) {
            this.$log.error("Not a resource", resource);
            throw new TypeError("ResourcesDataService.fetchParentResource failed: not a resource");
        }
        const type = resource.type;
        const key = resource.resource;
        const params = {
            key,
            org,
            type,
        };
        return this.$http({
            method: "GET",
            params,
            timeout: 10000,
            url: "api/whois/hierarchy/parents-of",
        });
    }

    public fetchResource(objectName: string, type: string): ng.IPromise<ng.IHttpResponse<IMoreSpecificsApiResult>> {
        const url = ["api/whois-internal/api/resources/", type, "/", objectName].join("");
        return this.$http({
            method: "GET",
            url,
        });
    }

    public fetchIpv4Resource(objectName: string): ng.IPromise<ng.IHttpResponse<IIPv4ResourcesResponse>> {
        return this.$http({
            method: "GET",
            url: "api/whois-internal/api/resources/inetnum/" + objectName,
        });
    }

    public fetchIpv6Resource(objectName: string): ng.IPromise<ng.IHttpResponse<IIPv6ResourcesResponse>> {
        return this.$http({
            method: "GET",
            url: "api/whois-internal/api/resources/inet6num/" + objectName,
        });
    }

    public fetchResources(orgId: string,
                          resourceType: string,
                          sponsored: boolean): ng.IPromise<ng.IHttpPromiseCallbackArg<IResourceOverviewResponseModel>> {
        if (!resourceType) {
            this.$log.error("fetchResources failed. No resourceType given");
            return;
        }
        const params = {
            type: resourceType,
        };
        if (sponsored) {
            params["sponsoring-org-id"] = orgId;
        } else {
            params["org-id"] = orgId;
        }
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

    public fetchIpv4Analysis(orgId: string): ng.IPromise<ng.IHttpResponse<IIpv4Analysis>> {
        return this.$http({
            method: "GET",
            params: {"org-id": orgId},
            timeout: 30000,
            url: "api/whois-internal/api/resources/ipanalyser/ipv4.json",
        });
    }

    public fetchTicketsAndDates(orgId: string, resource: string): ng.IPromise<ng.IHttpResponse<IResourceTickets>> {
        return this.$http({
            method: "GET",
            url: "api/ba-apps/resources/" + orgId + "/" + resource,
        });
    }

}

angular
    .module("dbWebApp")
    .service("ResourcesDataService", ResourcesDataService);
