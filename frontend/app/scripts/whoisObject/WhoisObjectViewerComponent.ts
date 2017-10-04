class WhoisObjectViewerController {

    public static $inject = [
        "Properties",
        "Labels",
    ];

    private static MAX_ATTR_NAME_MASK = "                ";
    private static HAS_RIPE_STAT_LINK = [
        "aut-num",
        "route",
        "route6",
        "inetnum",
        "inet6num",
    ];

    public ngModel: IWhoisObjectModel;
    public updateClicked: (model: IWhoisObjectModel) => void;

    public nrLinesToShow: number;
    public showMoreButton: boolean;
    public showMoreInfo: boolean;
    public objectPrimaryKey: string;
    public pkLink: string;

    public showRipeManagedAttrs = true;

    public show = {
        ripeManagedToggleControl: false,
        ripeStatButton: false,
        updateButton: false,
    };

    private objLength: number;

    constructor(public properties: { [key: string]: string },
                public labels: { [key: string]: string }) {
        this.objLength = this.ngModel.attributes.attribute.length;
        this.nrLinesToShow = this.objLength > 30 ? 25 : 30;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
        this.showMoreInfo = true;
        this.objectPrimaryKey = this.ngModel["primary-key"].attribute.map((attr) => attr.value).join("");
        this.pkLink = this.ngModel["primary-key"].attribute[0].name;
        this.show.ripeStatButton = WhoisObjectViewerController.HAS_RIPE_STAT_LINK
            .indexOf(this.ngModel.type.toLowerCase()) > -1;
        this.show.updateButton = typeof this.updateClicked === "function";
        this.show.ripeManagedToggleControl = this.ngModel.comaintained;
    }

    public clickShowMoreLines() {
        this.nrLinesToShow = this.objLength;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
    }

    public padding(attr: IAttributeModel): string {
        const numLeftPads = attr.name.length - WhoisObjectViewerController.MAX_ATTR_NAME_MASK.length;
        return WhoisObjectViewerController.MAX_ATTR_NAME_MASK.slice(numLeftPads);
    }

}

angular.module("dbWebApp").component("whoisObjectViewer", {
    bindings: {
        ngModel: "<",
        updateClicked: "&?",
    },
    controller: WhoisObjectViewerController,
    templateUrl: "scripts/whoisObject/whois-object-viewer.html",
});
