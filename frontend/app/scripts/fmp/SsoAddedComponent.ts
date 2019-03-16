class SsoAddedComponent {

    public static $inject = ["$stateParams"];

    public mntnerKey: string;
    public user: any;

    constructor($stateParams: ng.ui.IStateParamsService) {
        this.mntnerKey = $stateParams.mntnerKey;
        this.user = $stateParams.user;
    }
}

angular.module("fmp")
    .component("ssoAdded", {
        controller: SsoAddedComponent,
        templateUrl: "./ssoAdded.html",
    });
