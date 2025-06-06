import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { ObjectTypesEnum } from './object-types.enum';
import { IQueryParameters, QueryParametersService } from './query-parameters.service';

@Component({
    selector: 'types-panel',
    templateUrl: './types-panel.component.html',
    standalone: false,
})
export class TypesPanelComponent {
    @Input()
    public availableTypes: string[];
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    readonly ObjectTypesEnum = ObjectTypesEnum;
    public isMobileView: boolean = PropertiesService.isMobileView();

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
