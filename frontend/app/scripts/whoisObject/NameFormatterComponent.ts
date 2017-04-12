class NameFormatterController {

    public formatted: string;
    public name: string;
    public type: string;

    constructor() {
        if (typeof this.type === "string" && this.type.toUpperCase() === "INETNUM") {
            this.formatted = new IpAddressService().formatAsPrefix(this.name);
        } else {
            this.formatted = this.name || "";
        }
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
