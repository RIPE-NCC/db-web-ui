interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        ipanalyserRedirect: boolean;
        objectName: string;
        objectType: string;
        sponsored: boolean;
    };
}

class ResourceDetailsController {

    public static $inject = [
        "$scope",
        "$state",
        "$timeout",
        "$location",
        "$anchorScroll",
        "$cookies",
        "CredentialsService",
        "Labels",
        "MntnerService",
        "MoreSpecificsService",
        "Properties",
        "ResourceStatus",
        "ResourcesDataService",
        "RestService",
    ];

    public whoisObject: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificsApiResult;
    public resource: any;
    public flags: any[] = [];
    public canHaveMoreSpecifics: boolean;
    public nrMoreSpecificsToShow: number = 50;
    public show: {
        editor: boolean;
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
    public ipanalyserRedirect = false;

    public ipFilter: string = null;

    private orgId: string;
    private objectName: string;
    private objectType: string;

    private lastPage: number;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: ng.IPromise<any> = null;
    private source: string;

    constructor(private $scope: angular.IScope,
                private $state: IResourceDetailsControllerState,
                private $timeout: ng.ITimeoutService,
                private $location: angular.ILocationService,
                private $anchorScroll: ng.IAnchorScrollService,
                private $cookies: angular.cookies.ICookiesService,
                private credentialsService: CredentialsService,
                private labels: { [key: string]: string },
                private MntnerService: MntnerService,
                private MoreSpecificsService: IMoreSpecificsDataService,
                private properties: { SOURCE: string },
                private ResourceStatus: any,
                private ResourcesDataService: ResourcesDataService,
                private RestService: RestService) {

        this.show = {
            editor: false,
            viewer: true,
        };
        this.objectName = decodeURIComponent($state.params.objectName);
        this.objectType = $state.params.objectType.toLowerCase();
        this.sponsored = typeof this.$state.params.sponsored === "string"
            ? this.$state.params.sponsored === "true"
            : this.$state.params.sponsored;

        this.canHaveMoreSpecifics = false;
        this.lastPage = -1;
        this.getResourcesFromBackEnd();
        this.ResourcesDataService.fetchResource(this.objectName, this.objectType)
            .then((response: ng.IHttpPromiseCallbackArg<IResourceDetailsResponseModel>) => {
                this.whoisObject = response.data.object;
                this.source = this.whoisObject ? this.whoisObject.source.id : this.properties.SOURCE;
                // should only be one
                this.resource = response.data.resources[0] ? response.data.resources[0] : {
                    orgName: "",
                    resource: this.whoisObject["primary-key"].attribute[0].value,
                    type: this.objectType,
                };
                let hasRipeMaintainer = false;
                for (const attr of this.whoisObject.attributes.attribute) {
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
                if (!hasRipeMaintainer && response.data.notUnderContract) {
                    this.addFlag(this.labels["flag.noContract.text"],
                        this.labels["flag.noContract.title"], "orange");
                }
                if (response.data.sponsoredByOther) {
                    this.addFlag(this.labels["flag.otherSponsor.text"],
                        this.labels["flag.otherSponsor.title"], "orange");
                }
                if (response.data.sponsored) {
                    this.addFlag(this.labels["flag.sponsored.text"],
                        this.labels["flag.sponsored.title"], "orange");
                }
            });

        $scope.$on("fail-maintainer-password", () => {
            this.isEditing = false;
        });

        $scope.$on("selected-org-changed", (event: ng.IAngularEvent, selected: IUserInfoOrganisation) => {
            const selectedId = this.$cookies.get("activeMembershipId");
            if (selected && selectedId) {
                if (selectedId.indexOf("org:") === 0) {
                    if ("org:" + selected.orgObjectId === selectedId) {
                        return;
                    }
                } else if ((selected as IUserInfoRegistration).membershipId + "" === selectedId) {
                    return;
                }
            }
            this.$state.go("myresources");
        });
    }

    public updateButtonClicked(): void {
        this.resetMessages();
        const passwords = [];
        if (this.credentialsService.hasCredentials()) {
            passwords.push(this.credentialsService.getCredentials().successfulPassword);
        }

        const attributesWithoutDates = this.whoisObject.attributes.attribute
            .filter((attr: IAttributeModel) => attr.name !== "last-modified" && attr.name !== "created");
        const object = {objects: {object: [{attributes: {attribute: attributesWithoutDates}}]}};
        const pKey = this.whoisObject["primary-key"].attribute[0].value;
        this.RestService.modifyObject(this.source, this.objectType, pKey, object, passwords)
            .then((response: IWhoisResponseModel) => {
                    this.onSubmitSuccess(response);
                },
                (response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                    this.onSubmitError(response.data);
                });

        this.$timeout(() => {
            this.show.viewer = !this.show.viewer;
            this.show.editor = !this.show.editor;
            this.$scope.$apply();
        }, 1000);
    }

    public showObjectEditor(model: IWhoisObjectModel): void {
        this.resetMessages();
        this.isEditing = true;
        this.$location.hash("editortop");
        this.$anchorScroll();
    }

    public hideObjectEditor(): void {
        this.resetMessages();
        this.isEditing = false;
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.go("myresourcesdetail", {
            ipanalyserRedirect: this.ipanalyserRedirect,
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
        if (this.filterDebouncer) {
            this.$timeout.cancel(this.filterDebouncer);
        }
        this.filterDebouncer = this.$timeout(() => {
            this.lastPage = -1;
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
        this.whoisObject.attributes.attribute.forEach((a) => {
            a.$$error = "";
            a.$$invalid = false;
        });
    }

    private onSubmitSuccess(whoisResources: IWhoisResponseModel): void {
        const results = whoisResources.objects.object;
        if (results.length >= 1) {
            this.whoisObject = results[0];
        }
        this.isEditing = false;
        this.loadMessages(whoisResources);
        this.successes = ["Your object has been successfully updated."];
        this.$location.hash("editortop");
        this.$anchorScroll();
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
        const attributeErrors = whoisResources.errormessages.errormessage.filter((e) => e.attribute);
        attributeErrors.forEach((e) => {
            const attribute = this.whoisObject.attributes.attribute.find(
                (a) => a.name === e.attribute.name && a.value === e.attribute.value,
            );
            attribute.$$error = this.getErrorText(e);
        });
        this.loadMessages(whoisResources);
        if (this.errors.length === 0) {
            this.errors = ["Your object NOT updated, please review issues below"];
        }
        this.$location.hash("editortop");
        this.$anchorScroll();
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

    private getResourcesFromBackEnd(pageNr = 0, ipFilter = "") {
        if (pageNr <= this.lastPage) {
            // ignore requests for pages that we've done, or that we're are already fetching.
            return;
        }
        const url: string = "" + this.$state.current.url;
        if (url.indexOf("/myresources/detail") < 0) {
            this.lastPage = -1;
            this.showScroller = false;
            return;
        }
        this.lastPage = pageNr;
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.MoreSpecificsService.getSpecifics(this.objectName, this.objectType, pageNr, ipFilter)
                .then((response: ng.IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {

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

    private addFlag(textOnFlag: string, tooltip: string, colour?: string) {
        const flag = {
            colour,
            type: tooltip,
            value: textOnFlag,
        };
        if (tooltip === "status") {
            this.flags.unshift(flag);
        } else {
            this.flags.push(flag);
        }
    }

    private getTicketsAndDates() {
        this.ResourcesDataService.fetchTicketsAndDates(this.orgId, this.objectName)
            .then((response: ng.IHttpPromiseCallbackArg<IResourceTickets>) => {
                if (response.data.tickets !== undefined && response.data.tickets[this.objectName] !== undefined) {
                    for (const ticket of response.data.tickets[this.objectName]) {
                        this.addFlag(ticket.date, "Issue date for " + ticket.resource);
                        this.addFlag(ticket.number, "Ticket number for " + ticket.resource);
                    }
                }
            });
    }
}

angular.module("dbWebApp")
    .component("resourceDetails", {
        controller: ResourceDetailsController,
        templateUrl: "./resource-details.html",
    });