const flagDirective = () => ({
    scope: {
        text: "=",
        tooltip: "@",
    },
     templateUrl: "scripts/myresources/common/flags.html",
});

angular.module("dbWebApp").directive("flag", flagDirective);
