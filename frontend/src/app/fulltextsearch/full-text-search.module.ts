import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { SearchFieldComponent } from '../shared/sreachfield/search-field.component';
import { FullTextResponseService } from './full-text-response.service';
import { FullTextResultSummaryComponent } from './full-text-result-summary.component';
import { FullTextSearchComponent } from './full-text-search.component';
import { FullTextSearchService } from './full-text-search.service';

@NgModule({
    imports: [CommonModule, CoreModule, SharedModule, RouterModule, SearchFieldComponent, FullTextSearchComponent, FullTextResultSummaryComponent],
    providers: [FullTextResponseService, FullTextSearchService],
})
export class FullTextSearchModule {}
