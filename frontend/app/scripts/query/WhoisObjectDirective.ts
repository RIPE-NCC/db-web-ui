import * as angular from "angular";
import IScope = angular.IScope;

// any advance on 'sponsoring-org' & 'last-modified' (include colon)?
const MAX_ATTR_NAME_LENGTH = 14;
const MAX_ATTR_NAME_MASK = "              ";

interface IWhoisObjectScope extends IScope {
    ngModel: IWhoisObjectModel;
    padding: Function;
}

function WhoisObjectDirective(): angular.IDirective {

    return {
        link: (scope: IWhoisObjectScope) => {
            scope.padding = (attr: IWhoisObjectModel): string => {
                const numLeftPads = attr.name.length - MAX_ATTR_NAME_LENGTH;
                return MAX_ATTR_NAME_MASK.slice(numLeftPads);
            };
        },
        restrict: "E",
        scope: {
            ngModel: "=",
        },
        templateUrl: "scripts/query/object.html",
    };
}

angular
    .module("dbWebApp")
    .directive("whoisObject", WhoisObjectDirective);
