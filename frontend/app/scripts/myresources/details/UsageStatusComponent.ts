const SIZE: string[] = ['', 'K', 'M', 'G', 'T'];

class UsageStatusController {

    public static $inject = ["$log", "$state", "MyResourcesDataService"];

    private usage: IUsage;
    private percentageFree: number;
    private percentageUsed: number;

    private ipv6CalcTotal: string;
    private ipv6CalcUsed: string;
    private ipv6CalcFree: string;

    private objectKey: string;
    private objectType: string;

    constructor(private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private myResourcesDataService: IResourcesDataService) {

        this.objectKey = $state.params.objectName;
        this.objectType = $state.params.objectType.toLowerCase();

        this.getResource();
    }

    private getResource(): void {
        if (this.objectType === "inetnum") {
            this.myResourcesDataService.fetchIpv4Resource(this.objectKey).then(
                (response: IHttpPromiseCallbackArg<IPv4ResourcesResponse>) => {
                    this.processUsage(response);
                });
        } else if (this.objectType === "inet6num") {
            this.myResourcesDataService.fetchIpv6Resource(this.objectKey).then(
                (response: IHttpPromiseCallbackArg<IPv6ResourcesResponse>) => {
                    this.processUsage(response);
                    this.calcValueForIPv6();
                });
        }
    }

    private processUsage(response: IHttpPromiseCallbackArg<any>) {
        this.usage = response.data.resources[0].usage;
        this.usage.free = this.calcFreeSpace();
        //calculate percentage before calculating shorter value with binary prefix
        this.calcPercentage();
    }

    private calcFreeSpace(): number {
        return this.usage.total - this.usage.used;
    }

    private calcPercentage() {
        this.percentageUsed = this.usage.used * 100 / this.usage.total;
        this.percentageFree = 100 - this.percentageUsed;
    }

    private calcValueForIPv6() {
        this.ipv6CalcTotal = this.calcShorterValue(this.usage.total);
        this.ipv6CalcUsed = this.calcShorterValue(this.usage.used);
        this.ipv6CalcFree = this.calcShorterValue(this.usage.free);
    }

    private calcShorterValue(value: number): string {
        if(value === undefined) return '';
        let counter = 0;
        while (value >= 1024) {
            value = value / 1024;
            counter++;
        }
        return Math.round(value) + SIZE[counter];
    }
}

angular.module("dbWebApp").component("usageStatus", {
    controller: UsageStatusController,
    controllerAs: 'ctrlUsage',
    templateUrl: "scripts/myresources/details/usage-status.html",
});