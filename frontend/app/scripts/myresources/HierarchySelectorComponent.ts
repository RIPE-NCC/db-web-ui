interface IHierarchySelectorControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class HierarchySelectorController {

    public static $inject = ["$state", "ResourcesDataService", "UserInfoService"];

    public parents: string[];
    private resource: IResourceModel;

    constructor(private $state: IHierarchySelectorControllerState,
                private rds: IResourcesDataService,
                private userInfoService: any) {

        if (!this.resource || ["inetnum", "inet6num"].indexOf(this.resource.type) < 0) {
            return;
        }
        const selectedOrg = this.userInfoService.getSelectedLir();
        if (selectedOrg && selectedOrg.orgId) {
            rds.fetchParentResources(this.resource, selectedOrg.orgId).then(
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
    }

    public takeMeBackHome(parent: string) {
        if (!parent || !this.parents || !this.parents.length) {
            return this.$state.go("webupdates.myresources", {type: this.resource.type});
        }
        const target = parent ? parent : this.parents[this.parents.length - 1];
        const params = {
            objectName: target,
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
