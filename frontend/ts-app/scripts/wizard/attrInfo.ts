angular.module("dbWebApp").directive("attrInfo", ["WhoisMetaService", (WhoisMetaService: any) => {
        return {
            link: (scope: any, element: any, attrs: any) => {
                if (!attrs.objectType) {
                    return;
                }
                if (attrs.description) {
                    scope.text = WhoisMetaService.getAttributeDescription(attrs.objectType, attrs.description);
                } else if (attrs.syntax) {
                    scope.text = WhoisMetaService.getAttributeSyntax(attrs.objectType, attrs.syntax);
                }
            },
            restrict: "E",
            scope: {},
            template: "<span data-ng-bind-html=\"text\"></span>",
        };
    }]);
