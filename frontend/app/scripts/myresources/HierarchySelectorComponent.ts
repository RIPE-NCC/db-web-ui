interface IHierarchySelectorControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
        sponsored: boolean;
        ipanalyserRedirect: boolean;
    };
}

class HierarchySelectorController {

    public static $inject = ["$state", "ResourcesDataService", "UserInfoService"];

    private parents: string[];
    private resource: IResourceModel;

    constructor(private $state: IHierarchySelectorControllerState,
                private rds: IResourcesDataService,
                private UserInfoService: UserInfoService) {

        if (!this.resource || ["inetnum", "inet6num"].indexOf(this.resource.type) < 0) {
            return;
        }

        this.UserInfoService.getSelectedOrganisation().then((selOrg) => {
            if (selOrg && selOrg.orgObjectId) {
                this.fetchParents(selOrg.orgObjectId);
            }
        });
    }

    public showTopLevelResources() {
        const params = {
            ipanalyserRedirect: this.$state.params.ipanalyserRedirect,
            sponsored: this.$state.params.sponsored,
            type: this.resource.type,
        };
        this.$state.go("myresources", params);
    }

    public takeMeBackHome(parent: string) {
        if (!parent && !(this.parents && this.parents.length)) {
            return this.showTopLevelResources();
        }
        const target = parent ? parent : this.parents[this.parents.length - 1];
        const params = {
            ipanalyserRedirect: this.$state.params.ipanalyserRedirect,
            objectName: target,
            objectType: this.resource.type,
            sponsored: this.$state.params.sponsored,
        };
        this.$state.go("myresourcesdetail", params);
    }

    private fetchParents(orgId: string): void {
        this.rds.fetchParentResources(this.resource, orgId).then(
            (resp: ng.IHttpPromiseCallbackArg<string[]>) => {
                const parents: string[] = resp.data;
                this.parents = (parents && parents.length < 1) ? [] : parents;
                this.parents.push(this.resource.resource);
            });
    }
}

angular.module("dbWebApp").component("hierarchySelector", {
    bindings: {
        resource: "<",
    },
    controller: HierarchySelectorController,
    templateUrl: "./hierarchy-selector.html",
});
