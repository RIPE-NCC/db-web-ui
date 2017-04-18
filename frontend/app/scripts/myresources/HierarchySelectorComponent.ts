interface IHierarchySelectorControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class HierarchySelectorController {

    public static $inject = ["$log", "$state", "ResourcesDataService", "OrgDropDownStateService"];

    public parents: string[];
    public selectedParent: IResourceModel;
    private resource: IResourceModel;

    constructor(private $log: angular.ILogService,
                private $state: IHierarchySelectorControllerState,
                private rds: IResourcesDataService,
                private orgDropDownService: IOrgDropDownStateService) {

        if (!this.resource || ["inetnum", "inet6num"].indexOf(this.resource.type) < 0) {
            return;
        }
        orgDropDownService.getSelectedOrg().then((organisation: Organisation) => {
            if (organisation && organisation.orgId) {
                rds.fetchParentResources(this.resource, organisation.orgId).then(
                    (resp: IHttpPromiseCallbackArg<string[]>) => {
                        const parents: string[] = resp.data;
                        if (parents.length < 1) {
                            // no parents :'(
                            this.parents = [];
                        } else {
                            this.parents = parents;
                        }
                    });
            }
        });
    }

    public selected(parent:string) {
        console.log("this.selectedParent", this.selectedParent);
        // if (!this.selectedParent) {
        //     return;
        // }
        const params = {
            objectName: parent,
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
