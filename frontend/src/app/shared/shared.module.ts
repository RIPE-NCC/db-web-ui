import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { OrgDropDownComponent } from '../dropdown/org-drop-down.component';
import { WebAppVersionComponent } from '../version/web-app-version.component';
import { WhoisVersionComponent } from '../version/whois-version.component';
import { AlertBannersComponent } from './alert/alert-banners.component';
import { AlertsService } from './alert/alerts.service';
import { AutoFocusDirective } from './autofocus.directive';
import { CredentialsService } from './credentials.service';
import { AttributeInfoComponent } from './descriptionsyntax/attr-info.component';
import { DescriptionSyntaxComponent } from './descriptionsyntax/description-syntax.component';
import { FilteroutAttributeByHiddenPipe } from './filterout-attribute-by-hidden.pipe';
import { FilteroutAttributeByNamePipe } from './filterout-attribute-by-name.pipe';
import { FlagComponent } from './flag/flag.component';
import { HelpMarkerComponent } from './help-marker.component';
import { LabelPipe } from './label.pipe';
import { LoadingIndicatorComponent } from './loadingindicator/loading-indicator.component';
import { NameFormatterComponent } from './name-formatter.component';
import { PaginationComponent } from './paginator/pagination.component';
import { ReleaseNotificationService } from './release-notification.service';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { SanitizeImgHtmlPipe } from './sanitize-img-html.pipe';
import { ScrollerDirective } from './scroller.directive';
import { SubmittingAgreementComponent } from './submitting-agreement.component';
import { TableScrollerDirective } from './table-scroller.directive';
import { WhoisLineDiffDirective } from './whois-line-diff.directive';
import { WhoisMetaService } from './whois-meta.service';
import { WhoisResourcesService } from './whois-resources.service';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, FormsModule, NgbModule, NgbNavModule, NgSelectModule, MatButtonModule],
    declarations: [
        AlertBannersComponent,
        AutoFocusDirective,
        PaginationComponent,
        HelpMarkerComponent,
        LabelPipe,
        ScrollerDirective,
        TableScrollerDirective,
        LoadingIndicatorComponent,
        NameFormatterComponent,
        SubmittingAgreementComponent,
        AttributeInfoComponent,
        DescriptionSyntaxComponent,
        FlagComponent,
        FilteroutAttributeByHiddenPipe,
        FilteroutAttributeByNamePipe,
        SanitizeHtmlPipe,
        SanitizeImgHtmlPipe,
        WebAppVersionComponent,
        WhoisVersionComponent,
        WhoisLineDiffDirective,
        OrgDropDownComponent,
    ],
    providers: [CredentialsService, WhoisMetaService, WhoisResourcesService, AlertsService, OrgDropDownSharedService, ReleaseNotificationService],
    exports: [
        AlertBannersComponent,
        AutoFocusDirective,
        PaginationComponent,
        HelpMarkerComponent,
        LabelPipe,
        ScrollerDirective,
        LoadingIndicatorComponent,
        NameFormatterComponent,
        SubmittingAgreementComponent,
        AttributeInfoComponent,
        DescriptionSyntaxComponent,
        FlagComponent,
        FilteroutAttributeByHiddenPipe,
        FilteroutAttributeByNamePipe,
        SanitizeHtmlPipe,
        SanitizeImgHtmlPipe,
        NgbModule,
        NgbNavModule,
        MatButtonModule,
        TableScrollerDirective,
        WhoisVersionComponent,
        WebAppVersionComponent,
        WhoisLineDiffDirective,
        OrgDropDownComponent,
    ],
})
export class SharedModule {}
