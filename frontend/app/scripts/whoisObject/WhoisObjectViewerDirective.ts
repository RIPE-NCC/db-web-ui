const MAX_ATTR_NAME_MASK = "                ";

interface IWhoisObjectScope extends angular.IScope {
    ngModel: IWhoisObjectModel;
    updateClicked: () => void;

    // local callbacks
    padding: (attr: IAttributeModel) => string;
    goToUpdate: () => void;

    nrLinesToShow: number;
    showMoreButton: boolean;
    showRipeStatsButton: boolean;
    objectPrimaryKey: string;
    clickShowMoreLines: () => void;
    showMoreInfo: boolean;
}

const WhoisObjectViewerDirective = () => ({

    link: (scope: IWhoisObjectScope) => {
        const objLength = scope.ngModel.attributes.attribute.length;
        scope.nrLinesToShow = objLength >= 30 ? 25 : 30;
        scope.showMoreButton = objLength > scope.nrLinesToShow;
        scope.showMoreInfo = true;
        scope.showRipeStatsButton = [
                "aut-num",
                "route",
                "route6",
                "inetnum",
                "inet6num",
            ].indexOf(scope.ngModel.type.toLowerCase()) > -1;

        scope.padding = (attr: IAttributeModel): string => {
            const numLeftPads = attr.name.length - MAX_ATTR_NAME_MASK.length;
            return MAX_ATTR_NAME_MASK.slice(numLeftPads);
        };

        scope.objectPrimaryKey = scope.ngModel["primary-key"].attribute.map((attr) => attr.value).join("");
        scope.clickShowMoreLines = () => {
            scope.nrLinesToShow += 25;
            scope.showMoreButton = objLength > scope.nrLinesToShow;
        };

        scope.goToUpdate = () => {
            scope.updateClicked();
        };
    },
    restrict: "E",
    scope: {
        ngModel: "=",
        updateClicked: "&",
    },
    templateUrl: "scripts/whoisObject/whois-object-viewer.html",

});

angular
    .module("dbWebApp")
    .directive("whoisObjectViewer", WhoisObjectViewerDirective);
