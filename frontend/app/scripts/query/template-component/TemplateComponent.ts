class TemplateComponent {
    public static $inject = ["QueryService"];

    public response: string;
    public query: ITemplateTerm;

    private templateQueries = ["-t", "--template"];

    constructor(private queryService: QueryService) {
    }

    public $onChanges(): void {
        if (_.include(this.templateQueries, this.query.templateType)) {
            this.queryService.searchTemplate(this.query.objectType)
                .then((response) => {
                    this.response = response.data;
                });
        } else {
            this.queryService.searchVerbose(this.query.objectType)
                .then((response) => {
                    this.response = response.data;
                });
        }
    }
}

angular.module("dbWebApp").component("lookupTemplate", {
    bindings: {
        query: "<",
    },
    controller: TemplateComponent,
    templateUrl: "./template-component.html",
});
