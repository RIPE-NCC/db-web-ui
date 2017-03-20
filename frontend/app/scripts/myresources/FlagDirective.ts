const flagDirective = () => ({
    scope: {
        text: "=",
        tooltip: "@",
    },
     templateUrl: "scripts/myresources/flags.html",
});

angular.module("dbWebApp").directive("flag", flagDirective);
