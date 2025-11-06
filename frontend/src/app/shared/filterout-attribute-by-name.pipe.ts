import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { IAttributeModel } from './whois-response-type.model';

@Pipe({
    name: 'filteroutAttributeByName',
    pure: false,
    standalone: true,
})
export class FilteroutAttributeByNamePipe implements PipeTransform {
    transform(items: IAttributeModel[], names: string[]): IAttributeModel[] {
        return items.filter((item) => !_.includes(names, item.name));
    }
}
