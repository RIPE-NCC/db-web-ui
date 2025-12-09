import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { IUserInfoOrganisation } from '../../dropdown/org-data-type.model';
import { IpAddressService } from '../ip-address.service';
import { IIpv4AllocationAnalysis, IIpv4Analysis, IIpv4OverlappingInetnumsAnalysis } from '../resource-type.model';
import { ResourcesDataService } from '../resources-data.service';

@Component({
    selector: 'alerts-drop-down',
    templateUrl: './alerts-drop-down.component.html',
    standalone: true,
    imports: [NgbDropdown, MatButton, NgbPopover, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem],
})
export class AlertsDropDownComponent implements OnChanges {
    private resourcesDataService = inject(ResourcesDataService);
    private route = inject(Router);

    @Input()
    public selectedOrganisation: IUserInfoOrganisation;
    public overlaps: IIpv4OverlappingInetnumsAnalysis[] = [];
    public syntaxErrors: string[] = [];
    public hasAlerts: boolean = false;
    public hasAllocations: boolean = false;

    public showDetail(resource: string): void {
        void this.route.navigate(['myresources/detail', 'inetnum', resource, 'false']);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadIpv4Analysis();
    }

    private loadIpv4Analysis(): void {
        if (!this.selectedOrganisation) {
            return;
        }
        this.resourcesDataService.fetchIpv4Analysis(this.selectedOrganisation.orgObjectId).subscribe((analysisResponse: IIpv4Analysis) => {
            this.overlaps = [];
            this.syntaxErrors = [];
            this.hasAlerts = false;
            this.hasAllocations = false;

            const analysis: IIpv4Analysis = analysisResponse;

            this.hasAllocations = analysis.allocations.length > 0;
            analysis.allocations.forEach((allocation: IIpv4AllocationAnalysis) => {
                if (allocation.violations.overlappingInetnums) {
                    this.overlaps = allocation.violations.overlappingInetnums.concat(this.overlaps);
                }
                if (allocation.violations.inetnumSyntaxErrors) {
                    this.syntaxErrors = allocation.violations.inetnumSyntaxErrors.concat(this.syntaxErrors);
                }
            });
            this.syntaxErrors = [].concat.apply([], this.syntaxErrors);

            this.hasAlerts = this.syntaxErrors.length > 0 || this.overlaps.length > 0;
        });
    }

    public getRange(inetnum: string): string {
        return IpAddressService.fromSlashToRange(inetnum);
    }
}
