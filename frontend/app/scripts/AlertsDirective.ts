const AlertsDirective = () => ({
    restrict: "E",
    templateUrl: "scripts/alertsDirective.html",
});

angular.module("dbWebApp").directive("alerts", AlertsDirective);
