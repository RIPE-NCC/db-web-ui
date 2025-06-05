import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IResultSummary } from './types.model';

@Component({
    selector: 'full-text-result-summary',
    templateUrl: './full-text-result-summary.component.html',
    standalone: false,
})
export class FullTextResultSummaryComponent implements OnChanges {
    @Input()
    public tabledata: IResultSummary[];
    @Output()
    public rowClicked: EventEmitter<string> = new EventEmitter<string>();

    public total: number;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['tabledata']) {
            let total = 0;
            for (const row of this.tabledata) {
                total += row.value;
            }
            this.total = total;
        }
    }

    public emitRowClicked(row: { type: IResultSummary }) {
        this.rowClicked.emit(row.type.name);
    }
}
