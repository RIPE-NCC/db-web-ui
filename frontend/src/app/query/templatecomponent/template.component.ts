import { Component, Input, OnChanges, inject } from '@angular/core';
import * as _ from 'lodash';
import { ITemplateTerm } from '../query-parameters.service';
import { QueryService } from '../query.service';

@Component({
    selector: 'lookup-template',
    template: `<pre>{{ response }}</pre>`,
    standalone: true,
})
export class TemplateComponent implements OnChanges {
    private queryService = inject(QueryService);

    @Input()
    public query: ITemplateTerm;
    public response: string;

    private templateQueries = ['-t', '--template'];

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
