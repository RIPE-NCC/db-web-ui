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
            scope.widgetHtml = scope.attribute.name === "reverse-zone"
                ? "scripts/whoisObject/attribute-reverse-zones.html"
                : scope.widgetHtml = "scripts/whoisObject/attribute.html";
        },
        restrict: "E",
        scope: {attributes: "=", attribute: "=", objectType: "=", source: "=", idx: "="},
        templateUrl: "scripts/whoisObject/attribute-renderer.html",
    };
};

angular.module("dbWebApp")
    .directive("attributeRenderer", AttributeRendererDirective);
