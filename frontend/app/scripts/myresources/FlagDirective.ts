const flagDirective = () => ({
    scope: {
        text: "=",
        tooltip: "@",
    },
     templateUrl: "scripts/myresources/flag.html",
});

angular.module("dbWebApp").directive("flag", flagDirective);
