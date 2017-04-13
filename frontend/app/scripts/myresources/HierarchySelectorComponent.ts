interface IHierarchySelectorControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class HierarchySelectorController {

    public static $inject = ["$log", "$state", "ResourcesDataService"];

    public parents: IResourceModel[] = [];
    public selectedParent: IResourceModel;
    private resource: IResourceModel;

    constructor(private $log: angular.ILogService,
                private $state: IHierarchySelectorControllerState,
                private rds: IResourcesDataService) {

        if (!this.resource || ["inetnum", "inet6num", "aut-num"].indexOf(this.resource.type) < 0) {
            return;
        }
        rds.fetchParentResources(this.resource).then((resp: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
            const parents = resp.data.objects.object;
            if (parents.length < 1) {
                // no parents :'(
                this.parents = [];
                return;
            }
            // Ignore parents which are less-specific than our top-level resources.
            for (const p of parents) {
                const res: IResourceModel = {
                    resource: p["primary-key"].attribute[0].value,
                    type: p.type,
                };
                this.parents.push(res);
            }
        });
    }

    public clicked() {
        if (!this.selectedParent) {
            return;
        }
        const params = {
            objectName: this.selectedParent,
            objectType: this.resource.type,
        };
        this.$state.go("webupdates.myresourcesdetail", params);
    }
}

angular.module("dbWebApp").component("hierarchySelector", {
    bindings: {
        resource: "<",
    },
    controller: HierarchySelectorController,
    templateUrl: "scripts/myresources/hierarchy-selector.html",
});
