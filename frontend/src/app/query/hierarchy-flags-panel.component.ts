import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'hierarchy-flags',
    templateUrl: './hierarchy-flags-panel.component.html',
    standalone: false,
})
export class HierarchyFlagsPanelComponent implements OnInit, OnChanges {
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    public hierarchyFlag: number = 0;
    public isMobileView: boolean = PropertiesService.isMobileView();

    public ngOnInit() {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
    }

    public ngOnChanges(): void {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
    }

    public setHierarchyFlag(id: number) {
        this.queryParameters.hierarchy = HierarchyFlagsService.hierarchyFlagMap[id].short;
    }

    public setHierarchyFlagDescription(id: number) {
        return HierarchyFlagsService.hierarchyFlagMap[id ? id : 0].description;
    }

    public getShortHierarchyFlagName(id: number) {
        return HierarchyFlagsService.hierarchyFlagMap[id].short;
    }
}
