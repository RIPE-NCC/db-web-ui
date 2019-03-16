class LookupController {

    public static $inject = [
        "Properties",
    ];

    public ngModel: IWhoisObjectModel;
    public updateClicked: () => void;
    public show = {
        abuseContactFound: false,
        header: false,
        resourceHolderFound: false,
    };

    constructor(public properties: { [key: string]: string }) {
        // [Etch] should use the flags from the request -- don't do it like this...
        this.show.header = !!(this.ngModel["resource-holder"] || this.ngModel["abuse-contact"]);
        this.show.abuseContactFound = !!this.ngModel["abuse-contact"];
        this.show.resourceHolderFound = !!this.ngModel["resource-holder"];
    }
}

angular.module("dbWebApp").component("lookup", {
    bindings: {
        ngModel: "<",
        updateClicked: "&?",
    },
    controller: LookupController,
    templateUrl: "./lookup.html",
});
