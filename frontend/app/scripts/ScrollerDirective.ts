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

    /**
     * Call this function when widget is nearly on the screen. If the function returns true then the alert hides
     * and the directive stops listening.
     *
     * @type {{almostOnScreen: string}}
     */
    public scope = {
        almostOnScreen: "&scroller",
    };
    public templateUrl = "scripts/loading-indicator.html";

    private handle: any;

    constructor(private $document: angular.IDocumentService) {
    }

    public link: angular.IDirectiveLinkFn = (scope: IScrollerDirectiveScope, element: JQuery) => {
        let keepScrolling = true;
        let to: any;
        const handleScroll = () => {
            if (!keepScrolling) {
                return;
            }
            const raw = element[0];
            const nearly = raw.getBoundingClientRect().top <
                document.documentElement.clientHeight + document.body.scrollTop;
            if (nearly) {
                if (to) {
                    clearTimeout(to);
                }
                to = setTimeout(() => {
                    if (scope.almostOnScreen()) {
                        keepScrolling = false;
                        element.addClass("hide");
                    }
                }, 100);
            }
        };
        if (typeof scope.almostOnScreen === "function") {
            this.handle = angular.element(this.$document).on("scroll", handleScroll);
            scope.$on("$destroy", () => {
                angular.element(this.$document).off("scroll");
            });
            handleScroll();
        }
    }
}

angular.module("dbWebApp").directive("scroller", ScrollerDirective.factory());
