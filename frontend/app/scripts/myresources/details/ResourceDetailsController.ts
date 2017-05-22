interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
        sponsored: boolean;
    };
}

class ResourceDetailsController {

    public static $inject = [
        "$scope",
        "$log",
        "$state",
        "$timeout",
        "$anchorScroll",
        "CredentialsService",
        "MoreSpecificsService",
        "RestService",
        "WhoisDataService",
    ];

    public whoisResponse: IWhoisResponseModel;
    public details: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificsApiResult;
    public resource: any;
    public flags: any[] = [];
    public canHaveMoreSpecifics: boolean;
    public nrMoreSpecificsToShow: number = 50;
    public show: {
        editor: boolean;
        transition: boolean;
        viewer: boolean;
    };
    public showScroller = true;
    public sponsored = false;
    public isEditing = false;

    public ipFilter: string = null;

    private objectName: string;
    private objectType: string;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: IPromise<any> = null;
    private source = "RIPE";
    private errors: string[];
    private warnings: string[];
    private infos: string[];
    private successes: string[];

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private $timeout: ng.ITimeoutService,
                private $anchorScroll: ng.IAnchorScrollService,
                private CredentialsService: any,
                private MoreSpecificsService: IMoreSpecificsDataService,
                private RestService: any,
                private WhoisDataService: WhoisDataService) {

        this.show = {
            editor: false,
            transition: false,
            viewer: true,
        };
        this.objectName = $state.params.objectName;
        this.objectType = $state.params.objectType.toLowerCase();
        this.sponsored = this.$state.params.sponsored;

        this.canHaveMoreSpecifics = false;

        this.getResourcesFromBackEnd();

        this.WhoisDataService.fetchObject(this.source, this.objectType, this.objectName).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        type: this.objectType,
                    };
                    for (const attr of this.details.attributes.attribute) {
                        var flag = {type: attr.name, value: attr.value};
                        if (attr.name === "status") {
                            this.flags.unshift(flag);
                        } else if (attr.name === "netname" || attr.name === "as-name") {
                            this.flags.push(flag);
                        }
                    }
                }
            }, () => {
                this.whoisResponse = null;
            });
        // TODO: generate maintainer login failure event
        $scope.$on("fail-maintainer-password", () => {
            this.isEditing = false;
        });

        $scope.$on("selected-lir-changed", () => {
            this.$state.go("webupdates.myresources");
        });

    }

    public updateButtonClicked(): void {
        this.resetMessages();

        this.show.transition = true;

        const passwords = [];
        if (this.CredentialsService.hasCredentials()) {
            passwords.push(this.CredentialsService.getCredentials().successfulPassword);
        }

        const attributesWithoutDates = this.details.attributes.attribute
            .filter((attr: IAttributeModel) => attr.name !== "last-modified" && attr.name !== "created");
        const object = {objects: {object: [{ attributes: { attribute: attributesWithoutDates }}]}};
        const pKey = this.details["primary-key"].attribute[0].value;
        this.RestService.modifyObject(this.source, this.objectType, pKey, object, passwords)
            .then((response: IWhoisResponseModel) => { this.onSubmitSuccess(response); },
                (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => { this.onSubmitError(response.data); });

        this.$timeout(() => {
            this.show.viewer = !this.show.viewer;
            this.show.editor = !this.show.editor;
            this.$scope.$apply();
        }, 1000);
    }

    public showObjectEditor(): void {
        this.resetMessages();
        this.isEditing = true;
    }

    public hideObjectEditor(): void {
        this.resetMessages();
        this.isEditing = false;
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.go("webupdates.myresourcesdetail", {
            objectName: resource.resource,
            objectType: resource.type,
            sponsored: this.sponsored,
        });
    }

    /**
     * Called by 'scroller' directive.
     */
    public almostOnScreen(): void {
        if (this.nrMoreSpecificsToShow < this.moreSpecifics.resources.length) {
            this.nrMoreSpecificsToShow += 50;
            this.$scope.$apply();
        } else if (this.moreSpecifics.resources.length < this.moreSpecifics.filteredSize) {
            // resources still left on server? which ones? Use some magic!!!
            const pageNr = Math.ceil(this.moreSpecifics.resources.length / this.MAGIC);
            this.getResourcesFromBackEnd(pageNr, this.ipFilter);
            this.nrMoreSpecificsToShow += 50;
            this.$scope.$apply();
        }
        this.calcScroller();
    }

    public applyFilter(): void {
        if (this.filterDebouncer != null) {
            this.$timeout.cancel(this.filterDebouncer);
        }
        this.filterDebouncer = this.$timeout(() => {
            return this.getResourcesFromBackEnd(0, this.ipFilter);
        }, 400);
    }

    public isValidPrefix(maybePrefix: string): boolean {
        if (!maybePrefix) {
            return false;
        }
        return IpAddressService.isValidV4(maybePrefix)
            || IpAddressService.isValidRange(maybePrefix)
            || IpAddressService.isValidV6(maybePrefix);
    }

    private resetMessages() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.successes = [];
    }

    private onSubmitSuccess(whoisResources: IWhoisResponseModel): void {
        const results = whoisResources.objects.object;
        if (results.length >= 1) {
            this.details = results[0];
        }

        this.isEditing = false;

        this.successes = ["Your object has been successfully updated."];
        this.loadMessages(whoisResources);
    }

    private loadMessages(whoisResources: IWhoisResponseModel): void  {
        if (!whoisResources.errormessages || !whoisResources.errormessages.errormessage) {
            return;
        }

        this.errors = whoisResources.errormessages.errormessage
            .filter((e) => !e.attribute && e.severity.toLocaleLowerCase() === "error")
            .map((e) => this.getErrorText(e));

        this.warnings = whoisResources.errormessages.errormessage
            .filter((e) => e.severity.toLocaleLowerCase() === "warning")
            .map((e) => this.getErrorText(e));

        this.infos = whoisResources.errormessages.errormessage
            .filter((e) => e.severity.toLocaleLowerCase() === "info")
            .map((e) => this.getErrorText(e));
    }

    private onSubmitError(whoisResources: IWhoisResponseModel): void {
        const attributeErrors = whoisResources.errormessages.errormessage
            .filter((e) => e.attribute);
        attributeErrors.forEach((e) => {
            const attribute = this.details.attributes.attribute.find((a) => a.name === e.attribute.name);
            attribute.$$error = this.getErrorText(e);
        });

        this.loadMessages(whoisResources);

    }

    private getErrorText(error: IErrorMessageModel): string {
        let idx = 0;
        return error.text.replace(/%s/g, (match)  => {
            if (error.args.length - 1 >= idx) {
                const arg = error.args[idx].value;
                idx++;
                return arg;
            } else {
                return match;
            }
        });
    }

    private getResourcesFromBackEnd(pageNr = 0, ipFilter = ""): boolean {
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.MoreSpecificsService.getSpecifics(this.objectName, this.objectType, pageNr, ipFilter).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {

                    // More MAGIC! assume the next result follow the earlier ones, otherwise we need to track previous
                    // response sizes and work out how they fit with this lot.
                    if (pageNr === 0) {
                        this.moreSpecifics = response.data;
                    } else {
                        this.moreSpecifics.resources = this.moreSpecifics.resources.concat(response.data.resources);
                    }
                    this.canHaveMoreSpecifics = true;
                    this.calcScroller();

                }, () => {
                    this.calcScroller();
                });
        }
        return true;
    }

    private calcScroller(): void {
        if (!this.moreSpecifics) {
            return;
        }
        this.showScroller = this.nrMoreSpecificsToShow < this.moreSpecifics.filteredSize;
        this.$timeout(() => {
            this.$scope.$apply();
        }, 10);
    }
}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
