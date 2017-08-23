class FlagController {

    public text: string;
    public tooltip: string;

    constructor() {
        console.log("Text is", this.text, this.tooltip)
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
