import { Component, Input, OnChanges } from '@angular/core';
import { IQueryFlag, QueryFlagsService } from './query-flags.service';

@Component({
    selector: 'query-flags',
    templateUrl: './query-flags.component.html',
})
export class QueryFlagsComponent implements OnChanges {
    // whole string entered in search field
    @Input()
    public inputTerm: string;
    // all strings starting with - which user entered; valid and invalid flags
    public flags: string[];
    // just valid query flags
    public queryFlags: IQueryFlag[];

    constructor(private queryFlagsService: QueryFlagsService) {}

    public ngOnChanges() {
        this.flags = this.queryFlagsService.getFlagsFromTerm(this.inputTerm);
        this.queryFlags = this.flags?.length > 0 ? this.queryFlagsService.getFlags(this.flags) : [];
    }
}
