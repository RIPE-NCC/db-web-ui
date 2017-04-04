
interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class ResourceDetailsController {

    public static $inject = ["$scope", "$log", "$state", "QueryParametersService", "MoreSpecificsService"];

    public whoisResponse: IWhoisResponseModel;
    public details: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificResource[];
    public resource: any;
    public flags: string[] = [];
    public canHaveMoreSpecifics: boolean;
    public ipFilter: string = null;
    private ipAddressService = new IpAddressService();

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

        const objectKey = $state.params.objectName;
        const objectType = $state.params.objectType.toLowerCase();

        this.canHaveMoreSpecifics = false;
        if (objectType === "inetnum" || objectType === "inet6num") {
            this.loadMoreSpecifics();
        }

        this.queryParametersService.getWhoisObject(objectKey, objectType, "RIPE").then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        // status: "OK",
                        type: objectType,
                    };
                    for (const attr of this.details.attributes.attribute) {
                        if (attr.name === "status") {
                            this.flags.unshift(attr.value);
                        } else if (attr.name === "netname" || attr.name === "as-name") {
                            this.flags.push(attr.value);
                        }
                    }
                }
            }, () => {
                this.whoisResponse = null;
            });
    }

    public backToMyResources(): void {
        this.$state.go("webupdates.myresources");
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.go("webupdates.myresourcesdetail", {
            objectName: resource.resource,
            objectType: resource.type,
        });
    }

    public applyFilter(): void {
        if (!this.ipFilter || this.isValidPrefix(this.ipFilter)) {
            this.loadMoreSpecifics();
        }
    }

    public isValidPrefix(maybePrefix: string): boolean {
        if (!maybePrefix) {
            return false;
        }
        return this.ipAddressService.isValidV4(maybePrefix)
            || this.ipAddressService.isValidRange(maybePrefix)
            || this.ipAddressService.isValidV6(maybePrefix);
    }

    public formatAsPrefix(range: string): string {
        return this.ipAddressService.formatAsPrefix(range);
    }

    private loadMoreSpecifics(): void {
        this.$log.info("Reloading more specifics with the filter", this.ipFilter);
        const objectKey = this.$state.params.objectName;
        const objectType = this.$state.params.objectType.toLowerCase();
        this.moreSpecificsService.getSpecifics(objectKey, objectType, this.ipFilter).then(
            (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                this.moreSpecifics = response.data.resources;
                this.canHaveMoreSpecifics = true;
            });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
