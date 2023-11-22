import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'advance-filter-panel',
    templateUrl: './advance-filter-panel.component.html',
})
export class AdvanceFilterPanelComponent {
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
}
