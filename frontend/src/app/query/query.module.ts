import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSliderModule} from "@angular/material/slider";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatRadioModule} from "@angular/material/radio";

import {SharedModule} from "../shared/shared.module";
import {LookupService} from "./lookup.service";
import {LookupComponent} from "./lookup.component";
import {LookupSingleObjectComponent} from "./lookup-single-object.component";
import {QueryComponent} from "./query.component";
import {QueryParametersService} from "./query-parameters.service";
import {TemplateComponent} from "./templatecomponent/template.component";
import {QueryService} from "./query.service";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {CertificateBannerComponent} from "../banner/certificate-banner.component";
import {HierarchyFlagsPanelComponent} from "./hierarchy-flags-panel.component";
import {TypesPanelComponent} from "./types-panel.component";
import {HierarchyFlagsService} from "./hierarchy-flags.service";
import {InverseLookupPanelComponent} from "./inverse-lookup-panel.component";
import {AdvanceFilterPanelComponent} from "./advance-filter-panel.component";
import {QueryFlagsService} from "./query-flags.service";
import {QueryFlagsComponent} from "./query-flags.component";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        RouterModule,
        MatFormFieldModule,
        MatMenuModule,
        MatButtonModule,
        MatSliderModule,
        MatCheckboxModule,
        MatRadioModule,
        MatInputModule,
        MatIconModule
    ],
    declarations: [
        LookupComponent,
        LookupSingleObjectComponent,
        CertificateBannerComponent,
        QueryComponent,
        TemplateComponent,
        TypesPanelComponent,
        HierarchyFlagsPanelComponent,
        InverseLookupPanelComponent,
        AdvanceFilterPanelComponent,
        QueryFlagsComponent
    ],
    providers: [
        LookupService,
        QueryParametersService,
        QueryService,
        HierarchyFlagsService,
        QueryFlagsService
    ],
    entryComponents: [
        LookupComponent,
        LookupSingleObjectComponent,
        CertificateBannerComponent,
        QueryComponent,
        TemplateComponent,
        QueryFlagsComponent
    ],
    exports: [
      CertificateBannerComponent,
    ]
})
export class QueryModule {
}
