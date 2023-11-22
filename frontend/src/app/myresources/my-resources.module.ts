import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { AlertsDropDownComponent } from './alertsdropdown/alerts-drop-down.component';
import { AssociatedObjectsComponent } from './associatedobjects/associated-objects.component';
import { AssociatedObjectsService } from './associatedobjects/associated-objects.service';
import { HierarchySelectorComponent } from './hierarchyselector/hierarchy-selector.component';
import { HierarchySelectorService } from './hierarchyselector/hierarchy-selector.service';
import { IpUsageOfAllResourcesComponent } from './ip-usage-of-all-resources.component';
import { IpUsageComponent } from './ip-usage.component';
import { IpUsageService } from './ip-usage.service';
import { MoreSpecificsComponent } from './morespecifics/more-specifics.component';
import { MoreSpecificsService } from './morespecifics/more-specifics.service';
import { RefreshComponent } from './refresh/refresh.component';
import { ResourceItemComponent } from './resource-item.component';
import { ResourceStatusService } from './resource-status.service';
import { ResourceDetailsComponent } from './resourcedetails/resource-details.component';
import { ResourcesDataService } from './resources-data.service';
import { ResourcesComponent } from './resources.component';
import { TransferDropDownComponent } from './transferdropdown/transfer-drop-down.component';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, WhoisObjectModule, RouterModule],
    declarations: [
        AlertsDropDownComponent,
        TransferDropDownComponent,
        HierarchySelectorComponent,
        IpUsageComponent,
        IpUsageOfAllResourcesComponent,
        ResourceDetailsComponent,
        ResourceItemComponent,
        ResourcesComponent,
        MoreSpecificsComponent,
        AssociatedObjectsComponent,
        RefreshComponent,
    ],
    providers: [MoreSpecificsService, IpUsageService, ResourceStatusService, ResourcesDataService, HierarchySelectorService, AssociatedObjectsService],
    exports: [],
})
export class MyResourcesModule {}
