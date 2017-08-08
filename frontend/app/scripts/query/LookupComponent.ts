class LookupController {

    public ngModel: IWhoisObjectModel;
    public updateClicked: () => void;
}

angular.module("dbWebApp").component("lookup", {
    bindings: {
        ngModel: "<",
        updateClicked: "&?",
    },
    controller: LookupController,
    templateUrl: "scripts/query/lookup.html",
});
