import {Component, OnDestroy, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {IResourceDetailsResponseModel, IResourceTickets} from "./resource-type.model";
import {ResourcesDataService} from "./resources-data.service";
import {MntnerService} from "../updatesweb/mntner.service";
import {Labels} from "../label.constants";
import {ResourceStatusService} from "./resource-status.service";
import {RestService} from "../updatesweb/rest.service";
import {CredentialsService} from "../shared/credentials.service";
import {OrgDropDownSharedService} from "../dropdown/org-drop-down-shared.service";
import {
    IAttributeModel,
    IWhoisObjectModel,
    IWhoisResponseModel
} from "../shared/whois-response-type.model";
import {IUserInfoOrganisation, IUserInfoRegistration} from "../dropdown/org-data-type.model";
import {PropertiesService} from "../properties.service";
import {IFlag} from "./flag/flag.component";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "resource-details",
    templateUrl: "./resource-details.component.html",
})
export class ResourceDetailsComponent implements OnDestroy {

    public whoisObject: IWhoisObjectModel;
    public resource: any;
    public flags: IFlag[] = [];
    public show: {
        editor: boolean;
        viewer: boolean;
    };

    public showUsage: boolean;

    public sponsored = false;
    public isEditing = false;
    public ipanalyserRedirect = false;

    private orgId: string;
    public objectName: string;
    public objectType: string;

    private source: string;
    private subscriptions: any[] = [];

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(private cookies: CookieService,
                private credentialsService: CredentialsService,
                private mntnerService: MntnerService,
                private properties: PropertiesService,
                private resourceStatusService: ResourceStatusService,
                private resourcesDataService: ResourcesDataService,
                private restService: RestService,
                private orgDropDownSharedService: OrgDropDownSharedService,
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
        if (this.alertsComponent) {
            this.alertsComponent.clearErrors();
        }
        this.show = {
            editor: false,
            viewer: true,
        };
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectName = decodeURIComponent(paramMap.get("objectName"));
        this.objectType = paramMap.get("objectType").toLowerCase();
        this.sponsored = paramMap.get("sponsored") === "true";

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
                if (this.resource.iRR) {
                    this.addFlag(Labels["flag.iRR.text"],
                        Labels["flag.iRR.title"], "green");
                }
                if (this.resource.rDNS) {
                    this.addFlag(Labels["flag.rDNS.text"],
                        Labels["flag.rDNS.title"], "green");
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

    private resetMessages() {
        this.alertsComponent.clearErrors();
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
        this.alertsComponent.addGlobalSuccesses("Your object has been successfully updated.");
        document.querySelector("#editortop").scrollIntoView();
    }

    private loadMessages(whoisResources: IWhoisResponseModel): void {
        if (!whoisResources.errormessages || !whoisResources.errormessages.errormessage) {
            return;
        }
        this.alertsComponent.addErrors(whoisResources);
    }

    private onSubmitError(whoisResources: {data: IWhoisResponseModel}): void {
        const attributeErrors = whoisResources.data.errormessages.errormessage.filter((e) => e.attribute);
        attributeErrors.forEach((e) => {
            const attribute = this.whoisObject.attributes.attribute
                .find((a) => a.name === e.attribute.name && a.value === e.attribute.value,
            );
            attribute.$$error = WhoisResourcesService.readableError(e);
        });
        this.loadMessages(whoisResources.data);
        if (this.alertsComponent.getErrors().length === 0) {
            this.alertsComponent.addGlobalError("Your object NOT updated, please review issues below");
        }
        document.querySelector("#editortop").scrollIntoView();
    }

    private addFlag(textOnFlag: string, tooltip: string, colour?: string) {
        const flag: IFlag = {
            colour,
            tooltip,
            text: textOnFlag,
        };
        if (tooltip === "status") {
            this.flags.unshift(flag);
        } else {
            this.flags.push(flag);
        }
    }

    // Flags iRR and rDNS have to be last flags
    private moveFlagsIRRNRDNSOnEnd() {
        const indexIRRFlag = this.flags.findIndex(flag => flag.text === Labels["flag.iRR.text"]);
        this.flags = this.flags.concat(this.flags.splice(indexIRRFlag,1));
        const indexRDNSFlag = this.flags.findIndex(flag => flag.text === Labels["flag.rDNS.text"]);
        this.flags = this.flags.concat(this.flags.splice(indexRDNSFlag,1));
    }

    private getTicketsAndDates() {
        this.resourcesDataService.fetchTicketsAndDates(this.orgId, this.objectName)
            .subscribe((response: IResourceTickets) => {
                if (response.tickets !== undefined && response.tickets[this.objectName] !== undefined) {
                    for (const ticket of response.tickets[this.objectName]) {
                        this.addFlag(ticket.date, "Issue date for " + ticket.resource);
                        this.addFlag(ticket.number, "Ticket number for " + ticket.resource);
                    }
                    this.moveFlagsIRRNRDNSOnEnd();
                }
            });
    }
}
