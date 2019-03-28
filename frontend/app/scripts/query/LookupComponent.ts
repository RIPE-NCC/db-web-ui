class LookupController {

    public static $inject = [
        "Properties",
    ];

    public ngModel: IWhoisObjectModel;
    public updateClicked: () => void;
    public abuseContactFound = false;
    public abuseContactSuspected = false;
    public header = false;
    public resourceHolderFound = false;

    constructor(public properties: { [key: string]: string }) {
        this.header = !!(this.ngModel["resource-holder"] || this.ngModel["abuse-contact"]);
        this.abuseContactFound = !!this.ngModel["abuse-contact"];
        this.abuseContactSuspected = this.abuseContactFound && this.ngModel["abuse-contact"].suspect;
        this.resourceHolderFound = !!this.ngModel["resource-holder"];
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
