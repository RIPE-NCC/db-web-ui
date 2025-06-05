import { Component, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { ITemplateTerm } from '../query-parameters.service';
import { QueryService } from '../query.service';

@Component({
    selector: 'lookup-template',
    template: `<pre>{{ response }}</pre>`,
    standalone: false,
})
export class TemplateComponent implements OnChanges {
    @Input()
    public query: ITemplateTerm;
    public response: string;

    private templateQueries = ['-t', '--template'];

    constructor(private queryService: QueryService) {}

    public ngOnChanges() {
        if (_.includes(this.templateQueries, this.query.templateType)) {
            this.getTemplates();
        } else {
            this.getVerboses();
        }
    }

    private getTemplates() {
        this.queryService.searchTemplate(this.query.objectType).subscribe((response: string) => {
            this.response = response;
        });
    }

    private getVerboses() {
        this.queryService.searchVerbose(this.query.objectType).subscribe((response: string) => {
            this.response = response;
        });
    }
}
