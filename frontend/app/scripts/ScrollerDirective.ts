interface IScrollerDirectiveScope extends angular.IScope {
    almostOnScreen(): void;
}

class ScrollerDirective implements angular.IDirective {

    public static factory(): ng.IDirectiveFactory {
        const directive: ng.IDirectiveFactory = ($document: angular.IDocumentService) =>
            new ScrollerDirective($document);
        directive.$inject = ["$document"];
        return directive;
    }

    public restrict = "A";
    public scope = {almostOnScreen: "&scroller"};
    public templateUrl = "scripts/myresources/resource-item.html";

    constructor(private $document: angular.IDocumentService) {
    }

    public link: angular.IDirectiveLinkFn = (scope: IScrollerDirectiveScope, element: JQuery) => {
        const handleScroll = () => {
            const raw = element[0];
            const nearly = raw.getBoundingClientRect().top <
                document.documentElement.clientHeight + document.body.scrollTop;
            if (nearly && typeof scope.almostOnScreen === "function") {
                scope.almostOnScreen();
            }
        };
        angular.element(this.$document).on("scroll", handleScroll);
    }
}

angular.module("dbWebApp").directive("scroller", ScrollerDirective.factory());
