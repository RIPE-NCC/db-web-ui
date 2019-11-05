import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {CookieService} from "ngx-cookie-service";
import {IMoreSpecificsApiResult, MoreSpecificsService} from "./more-specifics.service";
import {IResourceDetailsResponseModel, IResourceModel, IResourceTickets} from "./resource-type.model";
import {ResourcesDataService} from "./resources-data.service";
import {IpAddressService} from "./ip-address.service";
import {MntnerService} from "../updates/mntner.service";
import {Labels} from "../label.constants";
import {ResourceStatusService} from "./resource-status.service";
import {RestService} from "../updates/rest.service";
import {CredentialsService} from "../shared/credentials.service";
import {OrgDropDownSharedService} from "../dropdown/org-drop-down-shared.service";
import {
    IAttributeModel,
    IErrorMessageModel,
    IWhoisObjectModel,
    IWhoisResponseModel
} from "../shared/whois-response-type.model";
import {IUserInfoOrganisation, IUserInfoRegistration} from "../dropdown/org-data-type.model";
import {PropertiesService} from "../properties.service";

interface IResourceDetailsControllerState {
    params: {
        ipanalyserRedirect: boolean;
        objectName: string;
        objectType: string;
        sponsored: boolean;
    };
}

@Component({
    selector: "resource-details",
    templateUrl: "./resource-details.component.html",
})
export class ResourceDetailsComponent {

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
    public objectType: string;

    private lastPage: number;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: any = null;
    private source: string;
    private subscriptions: any[] = [];

    constructor(private cookies: CookieService,
                private credentialsService: CredentialsService,
                private mntnerService: MntnerService,
                private moreSpecificsService: MoreSpecificsService,
                private properties: PropertiesService,
                private resourceStatusService: ResourceStatusService,
                private resourcesDataService: ResourcesDataService,
                private restService: RestService,
                private orgDropDownSharedService: OrgDropDownSharedService,
                private location: Location,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        const orgSubs = orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            const selectedId = this.cookies.get("activeMembershipId");
            if (selected && selectedId) {
                if (selectedId.indexOf("org:") === 0) {
                    if ("org:" + selected.orgObjectId === selectedId) {
                        return;
                    }
                } else if ((selected as IUserInfoRegistration).membershipId + "" === selectedId) {
                    return;
                }
            }
            router.navigate(["myresources/overview"])
        });
        const routeSubs = this.activatedRoute.params.subscribe((() => {
            this.isEditing = false;
            this.init();
        }));
        this.subscriptions.push(routeSubs);
        this.subscriptions.push(orgSubs);
    }

    public ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    public init() {
        this.flags = [];
        this.clearAlertMessages();
        this.show = {
            editor: false,
            viewer: true,
        };
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectName = decodeURIComponent(paramMap.get("objectName"));
        this.objectType = paramMap.get("objectType").toLowerCase();
        this.sponsored = paramMap.get("sponsored") === "true";

        this.canHaveMoreSpecifics = false;
        this.lastPage = -1;
        this.getResourcesFromBackEnd();
        this.resourcesDataService.fetchResource(this.objectName, this.objectType)
            .subscribe((response: IResourceDetailsResponseModel) => {
                this.whoisObject = response.object;
                this.source = this.whoisObject ? this.whoisObject.source.id : this.properties.SOURCE;
                // should only be one
                this.resource = response.resources[0] ? response.resources[0] : {
                    orgName: "",
                    resource: this.whoisObject["primary-key"].attribute[0].value,
                    type: this.objectType,
                };
                let hasRipeMaintainer = false;
                for (const attr of this.whoisObject.attributes.attribute) {
                    if (attr.name === "status") {
                        this.addFlag(attr.value, attr.name);
                        this.showUsage = this.resource.usage
                            && this.resourceStatusService.isResourceWithUsage(this.objectType, attr.value);
                    } else if (attr.name === "netname" || attr.name === "as-name") {
                        this.addFlag(attr.value, attr.name);
                    } else if (attr.name === "org") {
                        this.orgId = attr.value;
                    } else if (attr.name === "mnt-by" && !hasRipeMaintainer) {
                        if (this.mntnerService.isNccMntner(attr.value)) {
                            hasRipeMaintainer = true;
                        }
                    }
                }
                if (hasRipeMaintainer && typeof this.orgId === "string" && !this.sponsored) {
                    this.getTicketsAndDates();
                }
                if (!hasRipeMaintainer && response.notUnderContract) {
                    this.addFlag(Labels["flag.noContract.text"],
                        Labels["flag.noContract.title"], "orange");
                }
                if (response.sponsoredByOther) {
                    this.addFlag(Labels["flag.otherSponsor.text"],
                        Labels["flag.otherSponsor.title"], "orange");
                }
                if (response.sponsored) {
                    this.addFlag(Labels["flag.sponsored.text"],
                        Labels["flag.sponsored.title"], "orange");
                }
            });
    }

    public updateButtonClicked(modifiedWhoisObject: any): void {
        this.resetMessages();
        const passwords = [];
        if (this.credentialsService.hasCredentials()) {
            passwords.push(this.credentialsService.getCredentials().successfulPassword);
        }

        const attributesWithoutDates = modifiedWhoisObject.attributes.attribute
            .filter((attr: IAttributeModel) => attr.name !== "last-modified" && attr.name !== "created");
        const object = {objects: {object: [{attributes: {attribute: attributesWithoutDates}}]}};
        const pKey = modifiedWhoisObject["primary-key"].attribute[0].value;
        this.restService.modifyObject(this.source, this.objectType, pKey, object, passwords)
            .subscribe((response: IWhoisResponseModel) => {
                    this.onSubmitSuccess(response);
                },
                (response: any) => {
                    this.onSubmitError(response);
                });
        setTimeout(() => {
            this.show.viewer = !this.show.viewer;
            this.show.editor = !this.show.editor;
        },1000);
    }

    public showObjectEditor() {
        this.resetMessages();
        this.isEditing = true;
        document.querySelector("#editortop").scrollIntoView();
    }

    public hideObjectEditor(): void {
        this.resetMessages();
        this.isEditing = false;
    }

    /**
     * Called by 'scroller' directive.
     */
    public almostOnScreen(): void {
        if (this.nrMoreSpecificsToShow < this.moreSpecifics.resources.length) {
            this.nrMoreSpecificsToShow += 50;
        } else if (this.moreSpecifics.resources.length < this.moreSpecifics.filteredSize) {
            // resources still left on server? which ones? Use some magic!!!
            const pageNr = Math.ceil(this.moreSpecifics.resources.length / this.MAGIC);
            this.getResourcesFromBackEnd(pageNr, this.ipFilter);
            this.nrMoreSpecificsToShow += 50;
        }
        this.calcScroller();
    }

    public applyFilter() {
        if (this.filterDebouncer) {
            clearTimeout(this.filterDebouncer);
        }
        this.filterDebouncer = setTimeout(() => {
            this.lastPage = -1;
            this.getResourcesFromBackEnd(0, this.ipFilter);
        },400);
    }

    public isValidPrefix(maybePrefix: string): boolean {
        if (!maybePrefix) {
            return false;
        }
        return IpAddressService.isValidV4(maybePrefix)
            || IpAddressService.isValidRange(maybePrefix)
            || IpAddressService.isValidV6(maybePrefix);
    }

    private clearAlertMessages() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.successes = [];
    }

    private resetMessages() {
        this.clearAlertMessages();
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
        document.querySelector("#editortop").scrollIntoView();
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

    private onSubmitError(whoisResources: {data: IWhoisResponseModel}): void {
        const attributeErrors = whoisResources.data.errormessages.errormessage.filter((e) => e.attribute);
        attributeErrors.forEach((e) => {
            const attribute = this.whoisObject.attributes.attribute
                .find((a) => a.name === e.attribute.name && a.value === e.attribute.value,
            );
            attribute.$$error = this.getErrorText(e);
        });
        this.loadMessages(whoisResources.data);
        if (this.errors.length === 0) {
            this.errors = ["Your object NOT updated, please review issues below"];
        }
        document.querySelector("#editortop").scrollIntoView();
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
        if (this.location.path().indexOf("/myresources/detail") < 0) {
            this.lastPage = -1;
            this.showScroller = false;
            return;
        }
        this.lastPage = pageNr;
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.moreSpecificsService.getSpecifics(this.objectName, this.objectType, pageNr, ipFilter)
                .subscribe((response: IMoreSpecificsApiResult) => {

                    // More MAGIC! assume the next result follow the earlier ones, otherwise we need to track previous
                    // response sizes and work out how they fit with this lot.
                    if (pageNr === 0) {
                        this.moreSpecifics = response;
                    } else {
                        this.moreSpecifics.resources = this.moreSpecifics.resources.concat(response.resources);
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
        // FIXME
        setTimeout(() => {
            // this.$scope.$apply();
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
        this.resourcesDataService.fetchTicketsAndDates(this.orgId, this.objectName)
            .subscribe((response: IResourceTickets) => {
                if (response.tickets !== undefined && response.tickets[this.objectName] !== undefined) {
                    for (const ticket of response.tickets[this.objectName]) {
                        this.addFlag(ticket.date, "Issue date for " + ticket.resource);
                        this.addFlag(ticket.number, "Ticket number for " + ticket.resource);
                    }
                }
            });
    }
}