import {Component, Input, OnInit, Output, EventEmitter} from "@angular/core";
import {IQueryParameters} from "./query-parameters.service";

// TODO Maybe merge types-panel and inverse-lookup-panel into one component - depend on final design
@Component({
    selector: "types-panel",
    templateUrl: "./types-panel.component.html",
})
export class TypesPanelComponent implements OnInit {

    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();

    public ngOnInit() {
    }

}
