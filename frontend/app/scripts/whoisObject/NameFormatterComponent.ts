class NameFormatterController {

    public static $inject = ["IpAddressService"];

    public formatted: string;
    public name: string;
    public type: string;

    constructor(private IpAddressService: IpAddressService) {
        this.formatted =
            typeof this.type === "string" && this.type.toUpperCase() === "INETNUM"
                ? IpAddressService.formatAsPrefix(this.name)
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
