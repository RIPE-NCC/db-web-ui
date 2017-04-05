const MAX_ATTR_NAME_MASK = "                ";

interface IWhoisObjectScope extends angular.IScope {
    ngModel: IWhoisObjectModel;
    padding: (attr: IWhoisObjectModel) => string;
    mode: string;
    nrLinesToShow: number;
    showMoreButton: boolean;
    clickShowMoreLines: () => void;
    goToUpdate: () => void;
    showMoreInfo: boolean;
}

function WhoisObjectViewerDirective(): angular.IDirective {

    return {
        link: (scope: IWhoisObjectScope) => {
            const objLength = scope.ngModel.attributes.attribute.length;
            scope.nrLinesToShow = objLength >= 30 ? 25 : 30;
            scope.showMoreButton = objLength > scope.nrLinesToShow;
            scope.showMoreInfo = true;
            scope.mode = "view";

            scope.padding = (attr: IWhoisObjectModel): string => {
                const numLeftPads = attr.name.length - MAX_ATTR_NAME_MASK.length;
                return MAX_ATTR_NAME_MASK.slice(numLeftPads);
            };

            scope.clickShowMoreLines = () => {
                scope.nrLinesToShow += 25;
                scope.showMoreButton = objLength > scope.nrLinesToShow;
            };

            scope.goToUpdate = () => {
                scope.mode = "edit";
            };
        },
        restrict: "E",
        scope: {
            ngModel: "=",
        },
        templateUrl: "scripts/whoisObject/whois-object-viewer.html",
    };
}

angular
    .module("dbWebApp")
    .directive("whoisObjectViewer", WhoisObjectViewerDirective);
