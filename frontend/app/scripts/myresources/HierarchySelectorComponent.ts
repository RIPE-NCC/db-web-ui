class HierarchySelectorController {

    public textBinding: string;
    public dataBinding: number;
    public functionBinding: () => any;
    public name: string;

    constructor() {
        this.textBinding = "";
        this.dataBinding = 0;
    }

    public add(): void {
        this.functionBinding();
    }
}

angular.module("dbWebApp").component("hierarchySelector", {
    bindings: {
        name: "=",
    },
    controller: HierarchySelectorController,
    templateUrl: "scripts/myresources/hierarchy-selector.html",
});
