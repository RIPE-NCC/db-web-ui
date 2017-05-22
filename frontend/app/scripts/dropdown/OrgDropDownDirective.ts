const OrgDropDownDirective = () => ({
    controller: "OrgDropDownController",
    controllerAs: "orgDropDown",
    scope: {},
    templateUrl: "scripts/dropdown/org-drop-down.html",
});

angular.module("dbWebApp").directive("orgDropDown", OrgDropDownDirective);
