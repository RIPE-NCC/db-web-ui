class MailSentController {

    public static $inject = ["$stateParams"];

    public email: string;

    constructor(private $stateParams: ng.ui.IStateParamsService) {
        this.email = $stateParams.email;
    }
}

angular.module("fmp").component("mailSent", {
    controller: MailSentController,
    templateUrl: "scripts/fmp/mailSent.html",
});
