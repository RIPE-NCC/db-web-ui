class TransferDropDownController {

    public static $inject = [
        "Properties",
    ];

    // Input
    public sponsoredMenu: boolean;

    constructor(private properties: IProperties) {}
}

angular.module("dbWebApp").component("transferDropDown", {
    bindings: {
        isMember: "<",
        sponsoredMenu: "<",
    },
    controller: TransferDropDownController,
    templateUrl: "scripts/transferdropdown/transfer-drop-down.html",
});
