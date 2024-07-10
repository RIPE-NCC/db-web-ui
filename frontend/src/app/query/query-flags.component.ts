import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IQueryFlag, QueryFlagsService } from './query-flags.service';

@Component({
    selector: 'query-flags',
    templateUrl: './query-flags.component.html',
})
export class QueryFlagsComponent implements OnChanges {
    // whole string entered in search field
    @Input()
    public inputTerm: string;
    @Output()
    public hasValidQueryFlags = new EventEmitter();
    // all strings starting with - which user entered; valid and invalid flags
    public flags: string[];
    // just valid query flags
    public queryFlags: IQueryFlag[];

    constructor(private queryFlagsService: QueryFlagsService) {}

    public ngOnChanges() {
        this.flags = this.getFlags();
        if (this.flags.length > 0) {
            this.queryFlagsService.getFlags(this.flags).subscribe((queryFlags) => {
                this.queryFlags = queryFlags;
                this.hasValidQueryFlags.emit(this.queryFlags.length > 0);
            });
        } else {
            this.queryFlags = [];
            this.hasValidQueryFlags.emit(false);
        }
    }

    public getFlags() {
        const sanitizedString: string = this.queryFlagsService.addSpaceBehindFlagT(this.inputTerm);
        const allTerms = sanitizedString.split(' ');
        return allTerms.filter((term) => term.startsWith('-'));
    }
}
