// any advance on 'sponsoring-org' & 'last-modified' (include colon)?

const MAX_ATTR_NAME_LENGTH = 15;
const MAX_ATTR_NAME_MASK = "                ";

interface IWhoisObjectScope extends angular.IScope {
    ngModel: IWhoisObjectModel;
    padding: (attr: IWhoisObjectModel) => string;
    nrLinesToShow: number;
    showMoreButton: boolean;
    clickShowMoreLines: () => void;
    showMoreInfo: boolean;
}

function WhoisObjectDirective(): angular.IDirective {

    return {
        link: (scope: IWhoisObjectScope) => {
            const objLength = scope.ngModel.attributes.attribute.length;
            scope.nrLinesToShow = objLength >= 30 ? 25 : 9999999;
            scope.showMoreButton = objLength > scope.nrLinesToShow;
            scope.showMoreInfo = false;

            scope.padding = (attr: IWhoisObjectModel): string => {
                const numLeftPads = attr.name.length - MAX_ATTR_NAME_LENGTH;
                return MAX_ATTR_NAME_MASK.slice(numLeftPads);
            };

            scope.clickShowMoreLines = () => {
                scope.nrLinesToShow += 25;
                scope.showMoreButton = objLength > scope.nrLinesToShow;
            };
        },
        restrict: "E",
        scope: {
            ngModel: "=",
        },
        templateUrl: "scripts/query/whois-object.html",
    };
}

angular
    .module("dbWebApp")
    .directive("whoisObject", WhoisObjectDirective);
