import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../shared/shared.module";
import {LookupService} from "./lookup.service";
import {LookupComponent} from "./lookup.component";
import {LookupSingleObjectComponent} from "./lookup-single-object.component";
import {QueryComponent} from "./query.component";
import {QueryParametersService} from "./query-parameters.service";
import {TemplateComponent} from "./templatecomponent/template.component";
import {QueryService} from "./query.service";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {TrainingBannerComponent} from "../banner/training-banner.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        RouterModule
    ],
    declarations: [
        LookupComponent,
        LookupSingleObjectComponent,
        TrainingBannerComponent,
        QueryComponent,
        TemplateComponent

    ],
    providers: [
        LookupService,
        QueryParametersService,
        QueryService,
    ],
    entryComponents: [
        LookupComponent,
        LookupSingleObjectComponent,
        TrainingBannerComponent,
        QueryComponent,
        TemplateComponent
    ],
    exports: [
      TrainingBannerComponent
    ]
})
export class QueryModule {
}
