class TextUpdateStateProvider {

    public static $inject = ["$stateProvider"];

    constructor(private $stateProvider: any) {
        $stateProvider
            .state("textupdates", {
                abstract: true,
                template: "<div ui-view></div>",
                url: "/textupdates",
            })
            .state("textupdates.create", {
                template: "<text-create></text-create>",
                url: "/create/:source/:objectType?noRedirect&rpsl",
            })
            .state("textupdates.modify", {
                template: "<text-modify></text-modify>",
                url: "/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect&rpsl",
            })
            .state("textupdates.multiDecision", {
                controller: "<text-multi-decision></text-multi-decision>",
                url: "/multiDecision",
            })
            .state("textupdates.multi", {
                template: "<text-multi></text-multi>",
                url: "/multi",
            });
    }
}

angular.module("textUpdates").config(TextUpdateStateProvider);
