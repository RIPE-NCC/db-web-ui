class AlertController {

    public static $inject = ["AlertService"];

    constructor(public AlertService: AlertService) {}
}

angular.module("dbWebApp").component("alerts", {
    controller: AlertController,
    templateUrl: "scripts/alerts.html",
});
