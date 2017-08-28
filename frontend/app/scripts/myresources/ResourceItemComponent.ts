class ResourceItemController {

    public static $inject = [
        "$state",
        "LabelService",
        "ResourceStatus",
    ];
    public item: IResourceScreenItem;
    public sponsored: boolean;
    public usedPercentage: number;
    public showProgressbar: boolean;

    public noContractText: string;
    public otherSponsorText: string;

    constructor(private $state: ng.ui.IStateService,
                private LabelService: ILabelService,
                private ResourceStatus: any) {
        if (this.item.usage) {
            this.usedPercentage = Math.round(this.item.usage.used * 100 / this.item.usage.total);
        }
        this.showProgressbar = this.item.type.toLowerCase() !== "aut-num" && !this.sponsored &&
            ResourceStatus.isResourceWithUsage(this.item.type, this.item.status);
        this.noContractText = this.LabelService.getLabel("noContractText");
        this.otherSponsorText = this.LabelService.getLabel("otherSponsorText");
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
