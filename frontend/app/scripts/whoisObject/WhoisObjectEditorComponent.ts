class WhoisObjectEditorController {

    public static $inject = [
        "$log",
        "AttributeMetadataService",
        "CredentialsService",
        "MessageStore",
        "WhoisDataService"];

    // Input
    public ngModel: IWhoisObjectModel;

    public objectName: string;
    public objectType: string;
    public source: string;
    private attributes: IAttributeModel[];
    private cancelClicked: () => void;
    private updateClicked: () => void;

    private originalAttibutes: IAttributeModel[];
    private missingMandatoryAttributes: string[];

    constructor(private log: angular.ILogService,
                private AttributeMetadataService: any,
                private CredentialsService: any,
                private MessageStore: any,
                private WhoisDataService: WhoisDataService) {

        // Assign to short-cut accessor.
        this.attributes = this.ngModel.attributes.attribute;

        // the type is always the first attribute
        this.objectName = this.attributes[0].value;
        this.objectType = this.attributes[0].name;

        if (typeof this.ngModel.source !== "undefined") {
            this.source = this.ngModel.source.id.toUpperCase();
        } else {
            this.source = "RIPE";
            this.ngModel.source = {
                id: this.source,
            };
        }
        let password: string;
        if (this.CredentialsService.hasCredentials()) {
            password = this.CredentialsService.getCredentials().successfulPassword;
        }
        WhoisDataService.fetchObject(this.source, this.objectType, this.objectName, password, false).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                const whois = response.data;
                // Should have a unique result
                if (!whois.objects.object || whois.objects.object.length !== 1) {
                    // uh-oh
                    throw new TypeError("WhoisDataService.fetchObject did not return a valid result");
                }
                // Update our refs to the new object
                this.ngModel = whois.objects.object[0];
                this.attributes = this.ngModel.attributes.attribute;
                this.objectName = this.attributes[0].value;
                this.objectType = this.attributes[0].name;

                // make a copy of the object in case we need to restore
                this.originalAttibutes = angular.copy(this.attributes);

                // decorate the object
                this.AttributeMetadataService.enrich(this.objectType, this.attributes);

                // add warning for the mandatory attributes which are not set
                const metadata = this.AttributeMetadataService.getAllMetadata(this.objectType);

                // get the attributes that are to be defin according to metadata but are actually not
                this.missingMandatoryAttributes = this.getMissingMandatoryAttributes(
                  metadata, this.ngModel.attributes.attribute);

                // save object for later diff in display-screen
                this.MessageStore.add("DIFF", _.cloneDeep(this.attributes));
            });
    }

    public btnCancelClicked() {
        this.ngModel.attributes.attribute = this.attributes = angular.copy(this.originalAttibutes);
        this.cancelClicked();
    }

    public btnSubmitClicked() {
        this.updateClicked();
    }

    private getMissingMandatoryAttributes(metadata: any, attributes: any[]): string[] {
      return attributes.filter((a) => {
        const md = metadata[a.name];
        return md.minOccurs > 0 && !a.value;
      }).map((a) => a.name);
    }
}

angular.module("dbWebApp").component("whoisObjectEditor2", {
    bindings: {
        cancelClicked: "&",
        ngModel: "=",
        updateClicked: "&",
    },
    controller: WhoisObjectEditorController,
    templateUrl: "scripts/whoisObject/whois-object-editor.html",
});
