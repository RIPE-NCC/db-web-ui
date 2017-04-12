interface IAttributeRendererDirectiveScope extends angular.IScope {
    widgetHtml: string;
    attribute: {
        name: string;
    };
}

const AttributeRendererDirective = () => {
    return {
        controller: "AttributeCtrl",
        link: (scope: IAttributeRendererDirectiveScope) => {
            // choose the html template dynamically
            if (scope.attribute.name === "reverse-zone") {
                scope.widgetHtml = "scripts/wizard/attribute-reverse-zones.html";
            } else {
                scope.widgetHtml = "scripts/wizard/attribute.html";
            }
        },
        restrict: "E",
        scope: {attributes: "=", attribute: "=", objectType: "=", source: "=", idx: "="},
        templateUrl: "scripts/wizard/attribute-renderer.html",
    };
};

angular.module("dbWebApp")
    .directive("attributeRenderer", AttributeRendererDirective);
