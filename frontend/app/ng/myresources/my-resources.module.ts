import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {FlagComponent} from "./flag.component";
import {HierarchySelectorComponent} from "./hierarchy-selector.component";
import {ResourcesDataService} from "./resources-data.service";
import {MoreSpecificsService} from "./more-specifics.service";
import {IpAddressService} from "./ip-address.service";
import {IpUsageService} from "./ip-usage.service";
import {IpUsageComponent} from "./ip-usage.component";
import {IpUsageOfAllResourcesComponent} from "./ip-usage-of-all-resources.component";
import {ResourceDetailsComponent} from "./resource-details.component";
import {ResourceItemComponent} from "./resource-item.component";
import {ResourcesComponent} from "./resources.component";
import {AlertsDropDownComponent} from "./alertsdropdown/alerts-drop-down.component";
import {ResourceStatusService} from "./resource-status.service";
import {TransferDropDownComponent} from "./transferdropdown/transfer-drop-down.component";
import {RouterModule} from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        RouterModule
    ],
    declarations: [
        AlertsDropDownComponent,
        TransferDropDownComponent,
        FlagComponent,
        HierarchySelectorComponent,
        IpUsageComponent,
        IpUsageOfAllResourcesComponent,
        ResourceDetailsComponent,
        ResourceItemComponent,
        ResourcesComponent,
    ],
    providers: [
        IpAddressService,
        MoreSpecificsService,
        IpUsageService,
        ResourceStatusService,
        ResourcesDataService
    ],
    entryComponents: [
        AlertsDropDownComponent,
        TransferDropDownComponent,
        FlagComponent,
        HierarchySelectorComponent,
        IpUsageComponent,
        IpUsageOfAllResourcesComponent,
        ResourceDetailsComponent,
        ResourceItemComponent,
        ResourcesComponent,
    ],
    exports: [
    ]
})
export class MyResourcesModule {
}
