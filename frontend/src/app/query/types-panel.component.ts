import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ObjectTypesEnum } from './object-types.enum';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'types-panel',
    templateUrl: './types-panel.component.html',
})
export class TypesPanelComponent {
    @Input()
    public availableTypes: string[];
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    readonly ObjectTypesEnum = ObjectTypesEnum;

    isDisabled(type: ObjectTypesEnum) {
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
