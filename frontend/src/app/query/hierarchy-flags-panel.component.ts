import {Component, Input, OnInit, Output, EventEmitter, OnChanges} from "@angular/core";
import {IQueryParameters} from "./query-parameters.service";
import {HierarchyFlagsService} from "./hierarchy-flags.service";

@Component({
    selector: "hierarchy-flags",
    templateUrl: "./hierarchy-flags-panel.component.html",
})
export class HierarchyFlagsPanelComponent implements OnInit, OnChanges {

    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    public hierarchyFlag: number = 0;
    public descriptionPreview: string = HierarchyFlagsService.hierarchyFlagMap[this.hierarchyFlag].description;

    public ngOnInit() {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
    }

    public ngOnChanges(): void {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
    }

    public setHierarchyFlag(id: number) {
        this.queryParameters.hierarchy = HierarchyFlagsService.hierarchyFlagMap[id].short;
        this.descriptionPreview = HierarchyFlagsService.hierarchyFlagMap[id].description;
    }

    public getShortHierarchyFlagName(id: number) {
        return HierarchyFlagsService.hierarchyFlagMap[id].short
    }
}
