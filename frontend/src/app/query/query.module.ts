import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CertificateBannerComponent } from '../banner/certificate-banner.component';
import { SharedModule } from '../shared/shared.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { AdvanceFilterPanelComponent } from './advance-filter-panel.component';
import { HierarchyFlagsPanelComponent } from './hierarchy-flags-panel.component';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { InverseLookupPanelComponent } from './inverse-lookup-panel.component';
import { LookupSingleObjectComponent } from './lookup-single-object.component';
import { LookupComponent } from './lookup.component';
import { LookupService } from './lookup.service';
import { QueryFlagsComponent } from './query-flags.component';
import { QueryFlagsService } from './query-flags.service';
import { QueryParametersService } from './query-parameters.service';
import { QueryComponent } from './query.component';
import { QueryService } from './query.service';
import { SharePanelComponent } from './share-panel.component';
import { TemplateComponent } from './templatecomponent/template.component';
import { TypesPanelComponent } from './types-panel.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        RouterModule,
        MatFormFieldModule,
        MatMenuModule,
        MatSliderModule,
        MatCheckboxModule,
        MatRadioModule,
        MatInputModule,
        MatIconModule,
        ClipboardModule,
        MatTooltipModule,
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
        QueryFlagsComponent,
        SharePanelComponent,
    ],
    providers: [LookupService, QueryParametersService, QueryService, HierarchyFlagsService, QueryFlagsService],
    exports: [CertificateBannerComponent],
})
export class QueryModule {}
