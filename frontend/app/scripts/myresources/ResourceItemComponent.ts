class ResourceItemController {

    public static $inject = [
        "$state",
        "Labels",
        "ResourceStatus",
    ];
    public item: IResourceScreenItem;
    public sponsored: boolean;
    public ipanalyserRedirect: boolean;
    public usedPercentage: number;
    public showProgressbar: boolean;

    public flags: Array<{
        colour?: string;
        text: string;
        tooltip: string;
    }> = [];

    constructor(private $state: ng.ui.IStateService,
                private labels: { [key: string]: string },
                private ResourceStatus: any) {
        if (this.item.usage) {
            this.usedPercentage = Math.round(this.item.usage.used * 100 / this.item.usage.total);
        }
        this.showProgressbar = this.item.type.toLowerCase() !== "aut-num" && !this.sponsored &&
            ResourceStatus.isResourceWithUsage(this.item.type, this.item.status);

        if (this.item.status) {
            this.flags.push({text: this.item.status, tooltip: "status"});
        }
        if (this.item.netname) {
            this.flags.push({text: this.item.netname, tooltip: "netname"});
        }
        if (this.item.asname) {
            this.flags.push({text: this.item.asname, tooltip: "as-name"});
        }
        if (this.item.notRipeRegistered) {
            this.flags.push({
                colour: "orange",
                text: this.labels["flag.noContract.text"],
                tooltip: this.labels["flag.noContract.title"],
            });
        }
        if (this.item.sponsoredByOther) {
            this.flags.push({
                colour: "orange",
                text: this.labels["flag.otherSponsor.text"],
                tooltip: this.labels["flag.otherSponsor.title"],
            });
        }
    }

    public showDetail() {
        this.$state.go("myresourcesdetail", {
            ipanalyserRedirect: this.item.ipanalyserRedirect,
            objectName: this.item.resource,
            objectType: this.item.type,
            sponsored: this.sponsored,
        });
    }

}

angular.module("dbWebApp").component("resourceItem", {
    bindings: {
        ipanalyserRedirect: "<",
        item: "<",
        sponsored: "<",
    },
    controller: ResourceItemController,
    controllerAs: "ctrlResourceItem",
    templateUrl: "scripts/myresources/resource-item.html",
});
