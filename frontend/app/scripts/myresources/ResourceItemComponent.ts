class ResourceItemController {

    public static $inject = ["$state"];
    private item: any;
    private sponsored: boolean;
    private usedPercentage: number;
    private showProgressbar: boolean;

    constructor(private $state: ng.ui.IStateService) {
        if (this.item.usage) {
            this.usedPercentage = Math.round(this.item.usage.used * 100 / this.item.usage.total);
        }
        this.showProgressbar = this.item.type !== "aut-num" && !this.sponsored;
    }

    public showDetail() {
        this.$state.go("webupdates.myresourcesdetail", {
            objectName: this.item.resource,
            objectType: this.item.type,
            sponsored: this.sponsored,
        });
    };

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
