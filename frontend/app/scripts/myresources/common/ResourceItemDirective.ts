interface IResourceItemDirectiveScope extends angular.IScope {
    showDetail(item: IResourceModel): void;
}

class ResourceItemDirective implements angular.IDirective {

    public static factory(): ng.IDirectiveFactory {
        const directive: ng.IDirectiveFactory = ($state: ng.ui.IStateService) => new ResourceItemDirective($state);
        directive.$inject = ["$state"];
        return directive;
    }

    public restrict: string = "E";
    public scope: any = {
        item: "=",
    };
    public templateUrl: string = "scripts/myresources/common/resourceItem.html";

    constructor(private $state: ng.ui.IStateService) {
    }

    public link: angular.IDirectiveLinkFn = (scope: IResourceItemDirectiveScope) => {

        scope.showDetail = (item: IResourceModel) => {
            this.$state.transitionTo("webupdates.myresourcesdetail", {
                    objectName: item.resource,
                    objectType: item.type,
            });
        };
    }
}

angular.module("dbWebApp").directive("resourceItem", ResourceItemDirective.factory());
