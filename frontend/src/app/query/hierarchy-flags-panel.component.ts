import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { IQueryParameters } from './query-parameters.service';

@Component({
    selector: 'hierarchy-flags',
    templateUrl: './hierarchy-flags-panel.component.html',
    imports: [NgIf, MatSlider, MatSliderThumb, FormsModule, MatCheckbox, LabelPipe],
})
export class HierarchyFlagsPanelComponent implements OnInit, OnChanges {
    @Input()
    queryParameters: IQueryParameters;
    @Output()
    queryParametersChange = new EventEmitter<IQueryParameters>();
    @Output()
    numberSelected = new EventEmitter<number>();
    hierarchyFlag: number = 0;
    isMobileView: boolean = PropertiesService.isMobileView();

    ngOnInit() {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
    }

    ngOnChanges(): void {
        this.hierarchyFlag = HierarchyFlagsService.idHierarchyFlagFromShort(this.queryParameters.hierarchy);
        this.countSelectedHierarchyFlags();
    }

    setHierarchyFlag(id: number) {
        this.queryParameters.hierarchy = HierarchyFlagsService.hierarchyFlagMap[id].short;
        this.countSelectedHierarchyFlags();
    }

    setHierarchyFlagDescription(id: number) {
        return HierarchyFlagsService.hierarchyFlagMap[id ? id : 0].description;
    }

    getShortHierarchyFlagName(id: number) {
        return HierarchyFlagsService.hierarchyFlagMap[id].short;
    }

    countSelectedHierarchyFlags() {
        let count = 0;
        if (this.queryParameters.reverseDomain) {
            count++;
        }
        if (!!this.queryParameters.hierarchy && this.queryParameters.hierarchy !== HierarchyFlagsService.hierarchyFlagMap[0].short) {
            count++;
        }
        this.numberSelected.emit(count);
        this.queryParametersChange.emit({ ...this.queryParameters });
    }
}
