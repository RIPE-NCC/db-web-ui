import {Component, Input} from "@angular/core";
import {IAttributeModel} from "../shared/whois-response-type.model";

@Component({
    selector: 'attribute-reverse-zones',
    templateUrl: './attribute-reverse-zones.component.html'
})
export class AttributeReverseZonesComponent {
    @Input()
    public attribute: IAttributeModel;
}
