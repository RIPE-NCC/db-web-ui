import {Component, Input} from "@angular/core";
import {PropertiesService} from "../../properties.service";

@Component({
    selector: "transfer-drop-down",
    templateUrl: "./transfer-drop-down.component.html",
})
export class TransferDropDownComponent {

    @Input()
    public sponsoredMenu: boolean;

    constructor(public properties: PropertiesService) {}
}
