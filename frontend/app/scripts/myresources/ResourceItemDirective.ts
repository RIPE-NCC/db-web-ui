interface IResourceItemDirectiveScope extends angular.IScope {
    sponsored: boolean;
    showDetail(item: IResourceModel): void;
}

class ResourceItemDirective implements angular.IDirective {

    public static factory(): ng.IDirectiveFactory {
        const directive: ng.IDirectiveFactory = ($state: ng.ui.IStateService) => new ResourceItemDirective($state);
        directive.$inject = ["$state"];
        return directive;
    }

    public restrict = "E";
    public scope = {
        item: "=",
        sponsored: "=",
    };

    public templateUrl: string = "scripts/myresources/resource-item.html";

    private ipAddressService = new IpAddressService();

    constructor(private $state: ng.ui.IStateService) {
    }

    public link: angular.IDirectiveLinkFn = (scope: IResourceItemDirectiveScope, element: JQuery) => {
        element.addClass("resource-item");
        scope.showDetail = (item: IResourceModel) => {
            this.$state.go("webupdates.myresourcesdetail", {
                objectName: item.resource,
                objectType: item.type,
                sponsored: scope.sponsored,
            });
        };
    }
}

angular.module("dbWebApp").directive("resourceItem", ResourceItemDirective.factory());
