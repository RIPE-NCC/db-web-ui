class ModalDomainObjectSplashCotroller {

    public close: any;
    public dismiss: any;
    public resolve: any;

    constructor() {}

    public ok() {
        this.dismiss();
    }

    public cancel() {
        this.dismiss();
    }

    public goAway() {
        this.dismiss();
    }
}

angular.module("dbWebApp")
    .component("modalDomainObjectSplash", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalDomainObjectSplashCotroller,
        templateUrl: "scripts/wizard/modal-domain-object-splash.html",
    });
