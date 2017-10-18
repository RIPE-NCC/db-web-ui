class HelpMarkerController {

    public static $inject = [
        "Labels",
    ];

    // Inputs
    public labelKey: string;
    public link: string;

    // Outputs
    public titleLabel: string;
    public href: string;

    constructor(private labels: { [key: string]: string }) {
        this.titleLabel = labels[this.labelKey];
        this.href = this.link || undefined;
    }
}

angular.module("dbWebApp").component("helpMarker", {
    bindings: {
        labelKey: "@",
        link: "@",
    },
    controller: HelpMarkerController,
    template: "<span uib-popover-html=\"$ctrl.titleLabel\" popover-placement=\"bottom\" " +
    "popover-trigger=\"'mouseenter'\"><a href=\"{{ $ctrl.href }}\" ng-if='$ctrl.href' target='_blank'>" +
    "<span class=\"fa fa-question fa-lg\" aria-hidden=\"true\"></a>" +
    "<span  ng-if='!$ctrl.href' class=\"fa fa-question fa-lg\" aria-hidden=\"true\"></span>",
});
