
angular.module('dbWebApp').directive('attrInfo', ['WhoisMetaService', function (WhoisMetaService:any) {
        return {
            restrict: 'E',
            scope: {},
            template: '<span data-ng-bind-html="text"></span>',
            link: function (scope:any, element:any, attrs:any) {
                if (!attrs.objectType) {
                    return;
                }
                if (attrs.description) {
                    scope.text = WhoisMetaService.getAttributeDescription(attrs.objectType, attrs.description);
                } else if (attrs.syntax) {
                    scope.text = WhoisMetaService.getAttributeSyntax(attrs.objectType, attrs.syntax);
                }
            }
        };
    }]
);
