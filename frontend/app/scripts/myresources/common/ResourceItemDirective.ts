const resourceDirective = () => ({
    scope: {
        item: "=",
    },
     templateUrl: "scripts/myresources/common/resourceItem.html",
});

angular.module("dbWebApp").directive("resourceItem", resourceDirective);
