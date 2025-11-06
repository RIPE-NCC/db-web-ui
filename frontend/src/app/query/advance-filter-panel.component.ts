import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'advance-filter-panel',
    templateUrl: './advance-filter-panel.component.html',
    standalone: true,
    imports: [NgIf, FormsModule, MatRadioModule, MatCheckboxModule, LabelPipe],
})
export class AdvanceFilterPanelComponent implements OnChanges {
    @Input()
    queryParameters: IQueryParameters;
    @Output()
    queryParametersChange = new EventEmitter<IQueryParameters>();
    @Output()
    numberSelected = new EventEmitter<number>();
    isMobileView: boolean = PropertiesService.isMobileView();

    ngOnChanges(): void {
        this.countSelectedDropdownAdvanceFilter();
    }

    countSelectedDropdownAdvanceFilter() {
        let numberSelected = 0;
        if (this.queryParameters.showFullObjectDetails) {
            numberSelected++;
        }
        if (!this.queryParameters.doNotRetrieveRelatedObjects) {
            numberSelected++;
        }
        if (this.queryParameters.source !== 'RIPE') {
            numberSelected++;
        }
        this.numberSelected.emit(numberSelected);
        this.queryParametersChange.emit({ ...this.queryParameters });
    }
}
