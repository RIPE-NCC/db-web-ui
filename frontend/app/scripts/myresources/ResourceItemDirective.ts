interface IResourceItemDirectiveScope extends angular.IScope {
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
    };
    public templateUrl: string = "scripts/myresources/resource-item.html";

    constructor(private $state: ng.ui.IStateService) {
    }

    public link: angular.IDirectiveLinkFn = (scope: IResourceItemDirectiveScope, element: JQuery) => {
        element.addClass("resource-item");
        scope.showDetail = (item: IResourceModel) => {
            this.$state.go("webupdates.myresourcesdetail", {
                objectName: item.resource,
                objectType: item.type,
            });
        };
    }
}

angular.module("dbWebApp").directive("resourceItem", ResourceItemDirective.factory());
