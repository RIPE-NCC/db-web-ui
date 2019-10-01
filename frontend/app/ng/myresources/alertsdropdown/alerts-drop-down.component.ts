import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {ResourcesDataService} from "../resources-data.service";
import {IIpv4AllocationAnalysis, IIpv4Analysis, IIpv4OverlappingInetnumsAnalysis} from "../resource-type.model";
import {IpAddressService} from "../ip-address.service";
import {OrgDropDownSharedService} from "../../dropdown/org-drop-down-shared.service";
import {IUserInfoOrganisation} from "../../dropdown/org-data-type.model";
import {UserInfoService} from "../../userinfo/user-info.service";

@Component({
    selector: "alerts-drop-down",
    templateUrl: "./alerts-drop-down.component.html",
})
export class AlertsDropDownComponent {

    public overlaps: IIpv4OverlappingInetnumsAnalysis[] = [];
    public syntaxErrors: string[] = [];
    public hasAlerts: boolean = false;
    public hasAllocations: boolean = false;

    public showDetail(resource: string): void {
        this.route.navigate(["myresources/detail", "inetnum", resource ,"false"]);
    }

    constructor(private userInfoService: UserInfoService,
                private resourcesDataService: ResourcesDataService,
                private ipAddressService: IpAddressService,
                private route: Router,
                private orgDropDownSharedService: OrgDropDownSharedService) {
        orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.load(resourcesDataService, selected);
        });
    }

    public ngOnInit() {
        this.userInfoService.getSelectedOrganisation()
            .subscribe((org: IUserInfoOrganisation) => {
                this.load(this.resourcesDataService, org);
            });
    }

    private load(resourcesDataService: ResourcesDataService, org: IUserInfoOrganisation): void {
        if (!org) {
            return;
        }
        resourcesDataService.fetchIpv4Analysis(org.orgObjectId)
            .subscribe((analysisResponse: IIpv4Analysis) => {
            this.overlaps = [];
            this.syntaxErrors = [];
            this.hasAlerts = false;
            this.hasAllocations = false;

            const analysis: IIpv4Analysis = analysisResponse;

            this.hasAllocations = analysis.allocations.length > 0;
            analysis
                .allocations
                .forEach((allocation: IIpv4AllocationAnalysis, index: number, allocations: IIpv4AllocationAnalysis[]) => {
                    if (allocation.violations.overlappingInetnums) {
                        this.overlaps = allocation.violations.overlappingInetnums.concat(this.overlaps);
                    }
                });

            analysis
                .allocations
                .forEach((allocation: IIpv4AllocationAnalysis, index: number, allocations: IIpv4AllocationAnalysis[]) => {
                    if (allocation.violations.inetnumSyntaxErrors) {
                        this.syntaxErrors = allocation.violations.inetnumSyntaxErrors.concat(this.syntaxErrors);
                    }
                });
            this.syntaxErrors = [].concat.apply([], this.syntaxErrors);

            this.hasAlerts = this.syntaxErrors.length > 0 || this.overlaps.length > 0;
        });
    }

    public getRange(inetnum: string): string {
        return this.ipAddressService.fromSlashToRange(inetnum);
    }
}
