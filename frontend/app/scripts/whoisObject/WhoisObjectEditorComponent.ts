class WhoisObjectEditorController {

    public static $inject = [
        "AttributeMetadataService",
        "MessageStore",
        "Properties",
    ];

    // Input
    public ngModel: IWhoisObjectModel;

    public objectName: string;
    public objectType: string;
    public source: string;
    public missingMandatoryAttributes: string[] = [];

    public attributes: IAttributeModel[];
    public cancelClicked: () => void;
    public updateClicked: (model: IWhoisObjectModel) => void;

    private originalAttibutes: IAttributeModel[];

    constructor(private AttributeMetadataService: AttributeMetadataService,
                private MessageStore: MessageStore,
                private properties: { SOURCE: string }) {
    }

    public $onInit() {
        // Assign to short-cut accessor.
        this.attributes = this.ngModel.attributes.attribute;
        this.addCommentsToValueOfAtrributes(this.attributes);

        // the type is always the first attribute
        this.objectName = this.attributes[0].value;
        this.objectType = this.attributes[0].name;

        if (typeof this.ngModel.source !== "undefined") {
            this.source = this.ngModel.source.id.toUpperCase();
        } else {
            this.source = this.properties.SOURCE;
            this.ngModel.source = {
                id: this.source,
            };
        }
        const createdAttr = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name.toLowerCase() === "created";
        });
        if (createdAttr && createdAttr.length && createdAttr[0].value) {
            // make a copy of the object in case we need to restore
            this.originalAttibutes = angular.copy(this.attributes);

            // decorate the object
            this.AttributeMetadataService.enrich(this.objectType, this.attributes);

            // get the mandatory attributes for this object
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();

            // save object for later diff in display-screen
            this.MessageStore.add("DIFF", _.cloneDeep(this.attributes));

        } else {
            this.originalAttibutes = angular.copy(this.attributes);
            this.AttributeMetadataService.enrich(this.objectType, this.attributes);
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();
        }
    }

    public btnCancelClicked() {
        this.ngModel.attributes.attribute = this.attributes = angular.copy(this.originalAttibutes);
        this.cancelClicked();
    }

    public btnSubmitClicked() {
        this.removeEmptyAttributes();
        if (typeof this.updateClicked === "function") {
            this.updateClicked(this.ngModel);
        }
    }

    private removeEmptyAttributes() {
        // find indexes of empty attributes, highest index first
        const emptyAttrIndexes = this.attributes.map((attr: IAttributeModel, index: number) => {
            if (typeof(attr.value) !== "string" || attr.value.trim().length === 0) {
                return index;
            }
            return -1;
        }).filter((index: number) => {
            return index > 0;
        }).reverse();

        // remove the empty attributes
        for (const i of emptyAttrIndexes) {
            this.attributes.splice(i, 1);
        }
    }

    private addCommentsToValueOfAtrributes(attributes: IAttributeModel[]) {
        attributes.map((attr: IAttributeModel) => {
            if (attr.comment && attr.comment.trim().length > 0) {
                if (attr.value.trim().length === 0) {
                    attr.value += "# " + attr.comment;
                } else {
                    attr.value += " # " + attr.comment;
                }
                attr.comment = undefined;
            }
        });
    }

    /**
     * TODO: port  this to MetadataService
     * @returns {[string,string,string,string,string]}
     */
    private getMissingMandatoryAttributes(): string[] {

        const attrCopy = angular.copy(this.attributes);
        const shouldHave: IAttributeModel[] = this.AttributeMetadataService.determineAttributesForNewObject(this.objectType);
        const missing: any[] = [];
        Object.keys(shouldHave).forEach((k: string) => {
            const found = _.findIndex(attrCopy, (item) => (item.name === shouldHave[k].name));
            if (found > -1) {
                attrCopy.splice(found, 1);
            } else {
                missing.push(shouldHave[k].name);
            }
        });
        return missing;
    }
}

angular.module("dbWebApp").component("whoisObjectEditor", {
    bindings: {
        cancelClicked: "&",
        ngModel: "<",
        updateClicked: "&?",
    },
    controller: WhoisObjectEditorController,
    templateUrl: "./whois-object-editor.html",
});
