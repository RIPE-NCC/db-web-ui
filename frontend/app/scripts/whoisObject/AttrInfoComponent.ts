class AttributeInfoController {

    public static $inject = [
        "WhoisMetaService",
    ];

    public description: string;
    public objectType: string;
    public syntax: string;

    public text = "";

    constructor(private whoisMetaService: WhoisMetaService) {}

    public $onInit() {
        if (!this.objectType) {
            return;
        }
        if (this.description) {
            this.text = this.whoisMetaService.getAttributeDescription(this.objectType, this.description);
        } else if (this.syntax) {
            this.text = this.whoisMetaService.getAttributeSyntax(this.objectType, this.syntax);
        }
    }
}

angular.module("dbWebApp").component("attrInfo", {
    bindings: {
        description: "@",
        objectType: "@",
        syntax: "@",
    },
    controller: AttributeInfoController,
    template: "<span data-ng-bind-html=\"$ctrl.text\"></span>",
});
