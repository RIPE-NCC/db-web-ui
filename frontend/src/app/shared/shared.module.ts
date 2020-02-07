import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {CredentialsService} from "./credentials.service";
import {WhoisMetaService} from "./whois-meta.service";
import {WhoisResourcesService} from "./whois-resources.service";
import {AlertsService} from "./alert/alerts.service";
import {AlertsComponent} from "./alert/alerts.component";
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

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        DiffMatchPatchModule
    ],
    declarations: [
        AlertsComponent,
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
        FilteroutAttributeByHiddenPipe,
        FilteroutAttributeByNamePipe,
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
        AlertsComponent,
        PaginationComponent,
        LoadingIndicatorComponent,
        HelpMarkerComponent,
        NameFormatterComponent
    ],
    exports: [
        AlertsComponent,
        PaginationComponent,
        HelpMarkerComponent,
        LabelPipe,
        ScrollerDirective,
        LoadingIndicatorComponent,
        NameFormatterComponent,
        SubmittingAgreementComponent,
        AttributeInfoComponent,
        DescriptionSyntaxComponent,
        FilteroutAttributeByHiddenPipe,
        FilteroutAttributeByNamePipe,
        SanitizeImgHtmlPipe,
        NgbModule,
        TableScrollerDirective,
        WhoisVersionComponent,
        WebAppVersionComponent,
        WhoisLineDiffDirective
    ]
})
export class SharedModule {
}
