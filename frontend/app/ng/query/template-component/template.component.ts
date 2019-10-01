import {Component, Input} from "@angular/core";
import {QueryService} from "../query.service";
import {ITemplateTerm} from "../query-parameters.service";

@Component({
    selector: "lookup-template",
    template: `<pre>{{response}}</pre>`,
})
export class TemplateComponent {

    @Input()
    public query: ITemplateTerm;
    public response: string;

    private templateQueries = ["-t", "--template"];

    constructor(private queryService: QueryService) {
    }

    public ngOnChanges() {
        if (_.include(this.templateQueries, this.query.templateType)) {
            this.getTemplates();
        } else {
            this.getVerboses();
        }
    }

    private getTemplates() {
        this.queryService.searchTemplate(this.query.objectType)
            .subscribe((response: string) => {
                this.response = response;
            });
    }

    private getVerboses() {
        this.queryService.searchVerbose(this.query.objectType)
            .subscribe((response: string) => {
                this.response = response;
            });
    }
}
