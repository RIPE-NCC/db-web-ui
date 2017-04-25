interface IHierarchySelectorControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
        sponsored: boolean;
    };
}

class HierarchySelectorController {

    public static $inject = ["$scope", "$state", "ResourcesDataService", "UserInfoService"];

    public parents: string[];
    private resource: IResourceModel;

    constructor(private $scope: angular.IScope,
                private $state: IHierarchySelectorControllerState,
                private rds: IResourcesDataService,
                private userInfoService: any) {

        if (!this.resource || ["inetnum", "inet6num"].indexOf(this.resource.type) < 0) {
            return;
        }

        const selOrg = this.userInfoService.getSelectedLir();
        if (selOrg && selOrg.orgId) {
            rds.fetchParentResources(this.resource, selOrg.orgId).then(
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

        $scope.$on("lirs-loaded-event", (event: IAngularEvent, lirs: Organisation[]) => {
            const selectedOrg = userInfoService.getSelectedLir();
            if (lirs && lirs.length > 0) {
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
        });
    }

    public showTopLevelResources() {
        const params = {
          sponsored: this.$state.params.sponsored,
          type: this.resource.type,
        };
        this.$state.go("webupdates.myresources", params);
    }

    public takeMeBackHome(parent: string) {
        if (!parent && !this.parents.length) {
            return this.showTopLevelResources();
        }
        const target = parent ? parent : this.parents[this.parents.length - 1];
        const params = {
            objectName: target,
            objectType: this.resource.type,
            sponsored: this.$state.params.sponsored,
        };
        this.$state.go("webupdates.myresourcesdetail", params);
    }

}

angular.module("dbWebApp").component("hierarchySelector", {
    bindings: {
        resource: "<",
        sponsored: "<",
    },
    controller: HierarchySelectorController,
    templateUrl: "scripts/myresources/hierarchy-selector.html",
});
