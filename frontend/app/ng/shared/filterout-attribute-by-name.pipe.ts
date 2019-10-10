import {Pipe, PipeTransform} from "@angular/core";
import {IAttributeModel} from "./whois-response-type.model";

@Pipe({name: "filteroutAttributeByName", pure: false})
export class FilteroutAttributeByNamePipe implements PipeTransform {

    transform(items: IAttributeModel[], names: string[]): IAttributeModel[] {
        return items.filter(item => !_.contains(names, item.name));
    }
}
