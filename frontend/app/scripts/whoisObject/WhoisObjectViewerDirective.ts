const MAX_ATTR_NAME_MASK = "                ";

interface IWhoisObjectScope extends angular.IScope {
    ngModel: IWhoisObjectModel;
    updateObjectButtonClicked: (o: any) => void;

    padding: (attr: IWhoisObjectModel) => string;
    clickShowMoreLines: () => void;
    show: {
        moreInfo: boolean;
        showMoreButton: boolean;
        nrVisibleAttributes: number;
    };
}

function WhoisObjectViewerDirective(): angular.IDirective {

    return {
        link: (scope: IWhoisObjectScope) => {
            const objLength = scope.ngModel.attributes.attribute.length;
            scope.show = {
                moreInfo: true,
                nrVisibleAttributes: (objLength >= 30 ? 25 : 30),
                showMoreButton: (objLength > 30),
            };
            scope.padding = (attr: IWhoisObjectModel): string => {
                const numLeftPads = attr.name.length - MAX_ATTR_NAME_MASK.length;
                return MAX_ATTR_NAME_MASK.slice(numLeftPads);
            };

            scope.clickShowMoreLines = () => {
                scope.show.nrVisibleAttributes += 25;
                scope.show.showMoreButton = objLength > scope.show.nrVisibleAttributes;
            };

        },
        restrict: "E",
        scope: {
            ngModel: "=",
            updateObjectButtonClicked: "&updateClicked",
        },
        templateUrl: "scripts/whoisObject/whois-object-viewer.html",
    };
}

angular
    .module("dbWebApp")
    .directive("whoisObjectViewer", WhoisObjectViewerDirective);
