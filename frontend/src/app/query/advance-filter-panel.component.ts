import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'advance-filter-panel',
    templateUrl: './advance-filter-panel.component.html',
    imports: [NgIf, FormsModule, MatRadioModule, MatCheckboxModule, LabelPipe, MatFormFieldModule],
})
export class AdvanceFilterPanelComponent {
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    public isMobileView: boolean = PropertiesService.isMobileView();
}
