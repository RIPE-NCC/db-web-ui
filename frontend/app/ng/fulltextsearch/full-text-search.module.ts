import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {CoreModule} from "../core/core.module";
import {SharedModule} from "../shared/shared.module";
import {FullTextResponseService} from "./full-text-response.service";
import {FullTextSearchService} from "./full-text-search.service";
import {FullTextResultSummaryComponent} from "./full-text-result-summary.component";
import {FullTextSearchComponent} from "./full-text-search.component";

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        SharedModule,
        RouterModule
    ],
    declarations: [
        FullTextSearchComponent,
        FullTextResultSummaryComponent,
    ],
    providers: [
        FullTextResponseService,
        FullTextSearchService,
    ],
    entryComponents: [
        FullTextSearchComponent,
        FullTextResultSummaryComponent
    ]
})
export class FullTextSearchModule {
}
