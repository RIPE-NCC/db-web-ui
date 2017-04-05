const WhoisObjectEditorDirective = () => ({
    controller: "WhoisObjectController",
    controllerAs: "whoisObject",
    scope: {
        attributes: "=",
        objectName: "=",
        objectSource: "=",
        objectType: "=",
        updateClicked: "&",
    },
    templateUrl: "scripts/whoisObject/whois-attributes-editor.html",
});

angular.module("dbWebApp").directive("whoisObjectEditor", WhoisObjectEditorDirective);
