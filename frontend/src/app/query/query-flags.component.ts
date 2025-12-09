import { Component, Input, OnChanges, inject } from '@angular/core';
import { FlagComponent } from '../shared/flag/flag.component';
import { LabelPipe } from '../shared/label.pipe';
import { IQueryFlag, QueryFlagsService } from './query-flags.service';

@Component({
    selector: 'query-flags',
    templateUrl: './query-flags.component.html',
    standalone: true,
    imports: [FlagComponent, LabelPipe],
})
export class QueryFlagsComponent implements OnChanges {
    private queryFlagsService = inject(QueryFlagsService);

    // whole string entered in search field
    @Input()
    public inputTerm: string;
    // all strings starting with - which user entered; valid and invalid flags
    public flags: string[];
    // just valid query flags
    public queryFlags: IQueryFlag[];

    public ngOnChanges() {
        this.flags = this.queryFlagsService.getFlagsFromTerm(this.inputTerm);
        this.queryFlags = this.flags?.length > 0 ? this.queryFlagsService.getFlags(this.flags) : [];
    }
}
