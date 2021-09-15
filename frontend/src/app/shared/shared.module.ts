import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgbModule, NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {CredentialsService} from "./credentials.service";
import {WhoisMetaService} from "./whois-meta.service";
import {WhoisResourcesService} from "./whois-resources.service";
import {AlertsService} from "./alert/alerts.service";
import {HelpMarkerComponent} from "./help-marker.component";
import {LabelPipe} from "./label.pipe";
import {PaginationComponent} from "./paginator/pagination.component";
import {LoadingIndicatorComponent} from "./loadingindicator/loading-indicator.component";
import {ScrollerDirective} from "./scroller.directive";
import {TableScrollerDirective} from "./table-scroller.directive";
import {NameFormatterComponent} from "./name-formatter.component";
import {EnvironmentStatusService} from "./environment-status.service";
import {SubmittingAgreementComponent} from "./submitting-agreement.component";
import {FilteroutAttributeByNamePipe} from "./filterout-attribute-by-name.pipe";
import {FilteroutAttributeByHiddenPipe} from "./filterout-attribute-by-hidden.pipe";
import {SanitizeImgHtmlPipe} from "./sanitize-img-html.pipe";
import {DescriptionSyntaxComponent} from "./descriptionsyntax/description-syntax.component";
import {AttributeInfoComponent} from "./descriptionsyntax/attr-info.component";
import {WebAppVersionComponent} from "../version/web-app-version.component";
import {WhoisVersionComponent} from "../version/whois-version.component";
import {WhoisLineDiffDirective} from "./whois-line-diff.directive";
import {SanitizeHtmlPipe} from "./sanitize-html.pipe";
import {AlertBannersComponent} from "./alert/alert-banners.component";
import {FlagComponent} from "./flag/flag.component";

@NgModule({
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NgbNavModule,
        DiffMatchPatchModule
    ],
    declarations: [
        AlertBannersComponent,
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
        WhoisLineDiffDirective
    ],
    providers: [
        CredentialsService,
        WhoisMetaService,
        WhoisResourcesService,
        AlertsService,
        // Temporary just until we need different menu on test, training and rc enviroments
        EnvironmentStatusService,
    ],
    entryComponents: [
        AlertBannersComponent,
        PaginationComponent,
        LoadingIndicatorComponent,
        HelpMarkerComponent,
        NameFormatterComponent,
        FlagComponent,
    ],
    exports: [
        AlertBannersComponent,
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
        TableScrollerDirective,
        WhoisVersionComponent,
        WebAppVersionComponent,
        WhoisLineDiffDirective
    ]
})
export class SharedModule {
}
