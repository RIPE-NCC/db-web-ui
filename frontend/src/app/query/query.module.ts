import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TestingCommunityBannerComponent } from '../banner/testing-community-banner.component';
import { TypeformBannerComponent } from '../banner/typeform-banner/typeform-banner.component';
import { SharedModule } from '../shared/shared.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { AdvanceFilterPanelComponent } from './advance-filter-panel.component';
import { CertificateInfoComponent } from './certificate-info.component';
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
import { TypeformDialogComponent } from './typeform-dialog/typeform-dialog.component';
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
        TestingCommunityBannerComponent,
        MatDialogContent,
        MatDialogClose,
        TypeformBannerComponent,
        MatDialogTitle,
    ],
    declarations: [
        LookupComponent,
        LookupSingleObjectComponent,
        CertificateInfoComponent,
        QueryComponent,
        TemplateComponent,
        TypesPanelComponent,
        HierarchyFlagsPanelComponent,
        InverseLookupPanelComponent,
        AdvanceFilterPanelComponent,
        QueryFlagsComponent,
        SharePanelComponent,
        TypeformDialogComponent,
    ],
    providers: [LookupService, QueryParametersService, QueryService, HierarchyFlagsService, QueryFlagsService],
    exports: [CertificateInfoComponent],
})
export class QueryModule {}
