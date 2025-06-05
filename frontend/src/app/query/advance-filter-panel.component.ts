import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'advance-filter-panel',
    templateUrl: './advance-filter-panel.component.html',
    standalone: false,
})
export class AdvanceFilterPanelComponent {
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    public isMobileView: boolean = PropertiesService.isMobileView();
}
