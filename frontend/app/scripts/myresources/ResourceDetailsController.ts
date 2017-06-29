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
        "$location",
        "$anchorScroll",
        "CredentialsService",
        "MntnerService",
        "MoreSpecificsService",
        "ResourceStatus",
        "ResourcesDataService",
        "RestService",
        "WhoisDataService",
    ];

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

    public showUsage: boolean;

    // Shown in alert boxes
    public errors: string[];
    public warnings: string[];
    public infos: string[];
    public successes: string[];

    public showScroller = true;
    public sponsored = false;
    public isEditing = false;

    public ipFilter: string = null;

    private orgId: string;
    private objectName: string;
    private objectType: string;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: IPromise<any> = null;
    private source = "RIPE"; // TODO: calculate this value

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private $timeout: ng.ITimeoutService,
                private $location: angular.ILocationService,
                private $anchorScroll: ng.IAnchorScrollService,
                private CredentialsService: any,
                private MntnerService: any,
                private MoreSpecificsService: IMoreSpecificsDataService,
                private ResourceStatus: any,
                private ResourcesDataService: ResourcesDataService,
                private RestService: any,
                private WhoisDataService: WhoisDataService) {

        this.show = {
            editor: false,
            transition: false,
            viewer: true,
        };
        this.objectName = decodeURIComponent($state.params.objectName);
        this.objectType = $state.params.objectType.toLowerCase();
        this.sponsored = typeof this.$state.params.sponsored === "string"
            ? this.$state.params.sponsored === "true"
            : this.$state.params.sponsored;

        this.canHaveMoreSpecifics = false;
        this.getResourcesFromBackEnd();

        this.WhoisDataService.fetchObject(this.source, this.objectType, this.objectName).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        type: this.objectType,
                    };
                    let hasRipeMaintainer = false;
                    for (const attr of this.details.attributes.attribute) {
                        if (attr.name === "status") {
                            this.addFlag(attr.value, attr.name);
                            this.showUsage = ResourceStatus.isResourceWithUsage(this.objectType, attr.value);
                        } else if (attr.name === "netname" || attr.name === "as-name") {
                            this.addFlag(attr.value, attr.name);
                        } else if (attr.name === "org") {
                            this.orgId = attr.value;
                        } else if (attr.name === "mnt-by" && !hasRipeMaintainer) {
                            if (MntnerService.isNccMntner(attr.value)) {
                                hasRipeMaintainer = true;
                            }
                        }
                    }
                    if (hasRipeMaintainer && typeof this.orgId === "string" && !this.sponsored) {
                        this.getTicketsAndDates();
                    }
                }
            });

        $scope.$on("fail-maintainer-password", () => {
            this.isEditing = false;
        });

        $scope.$on("selected-lir-changed", () => {
            this.$state.go("myresources");
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
        const object = {objects: {object: [{attributes: {attribute: attributesWithoutDates}}]}};
        const pKey = this.details["primary-key"].attribute[0].value;
        this.RestService.modifyObject(this.source, this.objectType, pKey, object, passwords)
            .then((response: IWhoisResponseModel) => {
                    this.onSubmitSuccess(response);
                },
                (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                    this.onSubmitError(response.data);
                });

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
        this.$state.go("myresourcesdetail", {
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

        // explicitly clear errors on fields before submitting the form, should probably be done elsewhere
        this.details.attributes.attribute.forEach((a) => {
            a.$$error = "";
            a.$$invalid = false;
        });
    }

    private onSubmitSuccess(whoisResources: IWhoisResponseModel): void {
        const results = whoisResources.objects.object;
        if (results.length >= 1) {
            this.details = results[0];
        }

        this.isEditing = false;

        this.loadMessages(whoisResources);

        this.successes = ["Your object has been successfully updated."];
        this.scroll("db-object");
    }

    private loadMessages(whoisResources: IWhoisResponseModel): void {
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
            const attribute = this.details.attributes.attribute.find(
                (a) => a.name === e.attribute.name && a.value === e.attribute.value,
            );
            attribute.$$error = this.getErrorText(e);
        });
        this.loadMessages(whoisResources);
        if (this.errors.length === 0) {
            this.errors = ["Your object NOT updated, please review issues below"];
        }
        this.scroll("db-object");
    }

    private getErrorText(error: IErrorMessageModel): string {
        let idx = 0;
        return error.text.replace(/%s/g, (match) => {
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
            this.MoreSpecificsService.getSpecifics(this.objectName, this.objectType, pageNr, ipFilter)
                .then((response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {

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

    private scroll(anchor: string): void {
        this.$anchorScroll(anchor);
    }

    private addFlag(textOnFlag: string, tooltip: string) {
        const flag = {type: tooltip, value: textOnFlag};
        if (tooltip === "status") {
            this.flags.unshift(flag);
        } else {
            this.flags.push(flag);
        }
    }

    private getTicketsAndDates() {
        this.ResourcesDataService.fetchTicketsAndDates(this.orgId, this.objectName)
            .then((response: IHttpPromiseCallbackArg<IResourceTickets>) => {
                if (response.data.tickets !== undefined && response.data.tickets[this.objectName] !== undefined) {
                    for (const ticket of response.data.tickets[this.objectName]) {
                        this.addFlag(ticket.date, "Issue date for " + ticket.resource);
                        this.addFlag(ticket.number, "Ticket number for " + ticket.resource);
                    }
                }
            });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);