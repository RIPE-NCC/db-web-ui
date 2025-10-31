import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { ObjectTypesEnum } from './object-types.enum';
import { IQueryParameters, QueryParametersService } from './query-parameters.service';

@Component({
    selector: 'types-panel',
    templateUrl: './types-panel.component.html',
    imports: [NgIf, MatCheckbox, FormsModule, LabelPipe],
})
export class TypesPanelComponent implements OnChanges {
    @Input()
    public availableTypes: string[];
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    @Output()
    public numberSelected = new EventEmitter<number>();
    readonly ObjectTypesEnum = ObjectTypesEnum;
    public isMobileView: boolean = PropertiesService.isMobileView();

    ngOnChanges(): void {
        this.countSelectedCheboxes();
    }

    countSelectedCheboxes() {
        this.numberSelected.emit(Object.keys(this.queryParameters.types).filter((element) => this.queryParameters.types[element] === true).length);
    }

    isDisabled(type: ObjectTypesEnum) {
        // enable all types if inverse lookup is first choice
        if (QueryParametersService.inverseAsList(this.queryParameters).length > 0) {
            return false;
        }
        let disabled = !this.availableTypes.includes(type);
        if (disabled) {
            this.uncheckDisabledCheckbox(type);
        }
        return disabled;
    }

    private uncheckDisabledCheckbox(attribute: ObjectTypesEnum) {
        let enumKey = Object.keys(ObjectTypesEnum)[Object.values(ObjectTypesEnum).indexOf(attribute)];
        this.queryParameters.types[enumKey] = false;
    }
}
