import { Pipe, PipeTransform } from '@angular/core';
import { IAttributeModel } from './whois-response-type.model';

@Pipe({
    name: 'filteroutAttributeByHidden',
    pure: false,
    standalone: false,
})
export class FilteroutAttributeByHiddenPipe implements PipeTransform {
    transform(items: Array<IAttributeModel>): Array<IAttributeModel> {
        return items.filter((item) => !item.$$hidden);
    }
}
