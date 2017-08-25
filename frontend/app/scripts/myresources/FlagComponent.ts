class FlagController {

    public text: string;
    public tooltip: string;

    constructor() {
    }
}

angular.module("dbWebApp").component("flag", {
    bindings: {
        text: "<",
        tooltip: "<",
    },
    controller: FlagController,
    templateUrl: "scripts/myresources/flag.html",
});
