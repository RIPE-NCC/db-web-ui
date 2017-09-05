class NameFormatterController {

    public formatted: string;
    public name: string;
    public type: string;

    constructor() {
        this.formatted =
            typeof this.type === "string" && this.type.toUpperCase() === "INETNUM"
                ? new IpAddressService().formatAsPrefix(this.name)
                : this.name || "";
    }

}

angular.module("dbWebApp").component("nameFormatter", {
    bindings: {
        name: "=",
        type: "=",
    },
    controller: NameFormatterController,
    template: "{{ $ctrl.formatted }}",
});
