class EmailConfirmationController {

    public static $inject = ["$stateParams", "EmailConfirmationService"];

    public token: string;
    public validEmail: boolean = false;
    public loading: boolean = true;

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public EmailConfirmationService: EmailConfirmationService) {
        this.token = this.$stateParams.t;
        this.EmailConfirmationService
            .confirmEmail(this.token)
            .then((response: ng.IHttpPromiseCallbackArg<any>) => {
                this.loading = false;
                this.validEmail = true;
            }, (error: ng.IHttpPromiseCallbackArg<any>) => {
                this.loading = false;
            });
    }
}

angular.module("dbWebApp").component("emailConfirmation", {
    controller: EmailConfirmationController,
    templateUrl: "scripts/emailconfirmation/emailConfirm.html",
});
