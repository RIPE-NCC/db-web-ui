class ResourceItemController {

    public static $inject = [
        "$state",
        "ResourceStatus",
    ];
    private item: IResourceScreenItem;
    private sponsored: boolean;
    private usedPercentage: number;
    private showProgressbar: boolean;

    constructor(private $state: ng.ui.IStateService,
                private ResourceStatus: any) {
        if (this.item.usage) {
            this.usedPercentage = Math.round(this.item.usage.used * 100 / this.item.usage.total);
        }
        this.showProgressbar = this.item.type.toLowerCase() !== "aut-num" && !this.sponsored &&
            ResourceStatus.isResourceWithUsage(this.item.type, this.item.status);
    }

    public showDetail() {
        this.$state.go("myresourcesdetail", {
            objectName: this.item.resource,
            objectType: this.item.type,
            sponsored: this.sponsored,
        });
    }

}

angular.module("dbWebApp").component("resourceItem", {
    bindings: {
        item: "<",
        sponsored: "<",
    },
    controller: ResourceItemController,
    controllerAs: "ctrlResourceItem",
    templateUrl: "scripts/myresources/resource-item.html",
});
