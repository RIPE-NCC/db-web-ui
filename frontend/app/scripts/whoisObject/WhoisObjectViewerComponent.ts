class WhoisObjectViewerController {

    public static $inject = [
        "Properties",
        "UserInfoService",
    ];

    public ngModel: IWhoisObjectModel;
    public updateClicked: (model: IWhoisObjectModel) => void;

    public nrLinesToShow: number;
    public showMoreButton: boolean;
    public showMoreInfo: boolean;
    public objectPrimaryKey: string;
    public pkLink: string;
    public ripeStatLink: string;

    public showRipeManagedAttrs = true;

    public show = {
        loginLink: false,
        ripeManagedToggleControl: false,
        ripeStatButton: false,
        updateButton: false,
    };

    private objLength: number;
    private readonly MAX_ATTR_NAME_MASK = "                ";
    private readonly HAS_RIPE_STAT_LINK = [
        "aut-num",
        "route",
        "route6",
        "inetnum",
        "inet6num",
    ];
    constructor(public properties: IProperties,
                private userInfoService: UserInfoService) {
        this.objLength = this.ngModel.attributes.attribute.length;
        this.nrLinesToShow = this.objLength > 30 ? 25 : 30;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
        this.showMoreInfo = true;
        this.objectPrimaryKey = this.ngModel["primary-key"].attribute.map((attr) => attr.value).join("");
        this.pkLink = this.ngModel["primary-key"].attribute[0].name;
        this.show.ripeStatButton = this.HAS_RIPE_STAT_LINK.indexOf(this.ngModel.type.toLowerCase()) > -1;
        if (this.show.ripeStatButton) {
            this.ripeStatLink = this.getRipeStatLink();
        }

        this.userInfoService.getLoggedInUser().then((resp: IUserInfo) => {
            this.show.updateButton = typeof this.updateClicked === "function";
            this.show.loginLink = false;
        }, () => {
            this.show.loginLink = true;
        });
        this.show.ripeManagedToggleControl = this.ngModel.managed;
    }

    public clickShowMoreLines() {
        this.nrLinesToShow = this.objLength;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
    }

    public padding(attr: IAttributeModel): string {
        const numLeftPads = attr.name.length - this.MAX_ATTR_NAME_MASK.length;
        return this.MAX_ATTR_NAME_MASK.slice(numLeftPads);
    }

    public getRipeStatLink(): string {
        const routeObject = this.ngModel["primary-key"].attribute
            .find((attr) => attr.name === "route" || attr.name === "route6");
        return routeObject ? routeObject.value : this.objectPrimaryKey;
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
