class AttributeController {
    public static $inject = ["$sce", "AttributeMetadataService", "WhoisMetaService",
        "CharsetToolsService", "RestService", "EnumService", "ModalService", "CredentialsService", "WhoisResources"];

    private isHelpShown: boolean = false;
    private isMntHelpShown: boolean = false;
    private attribute: IAttributeModel;
    private attributes: IAttributeModel[];
    private source: string;
    private objectType: string;
    private roleForAbuseC: any;
    private widgetHtml: string;
    private idx: string;

    constructor(private $sce: any,
                private AttributeMetadataService: any,
                private WhoisMetaService: WhoisMetaService,
                private CharsetToolsService: CharsetToolsService,
                private RestService: RestService,
                private EnumService: EnumService,
                private ModalService: ModalService,
                private CredentialsService: CredentialsService,
                private WhoisResources: any) {

    }

    /*
     * this variables we can see because they"re bound by our directive: attributeRenderer
     *
     * objectType : string   -- Can be "organisation", "inetnum", whatever....
     * attributes : object[] -- The array of attributes which make up the object.
     * attribute  : object   -- The attribute which this controller is responsible for.
     */
    /*
     * Initial scope vars
     */
    public $onInit() {
        this.isHelpShown = false;
        this.isMntHelpShown = false;

        if (this.attribute.name === "source") {
            this.attribute.value = this.source;
            if (!this.attribute.$$meta) {
                this.attribute.$$meta = {};
            }
            this.attribute.$$meta.$$disable = true;
            this.attribute.$$invalid = false;
        }
        this.widgetHtml = this.attribute.name === "reverse-zone"
            ? "scripts/whoisObject/attribute-reverse-zones.html"
            : "scripts/whoisObject/attribute.html";
    }

    public isStaticList(objectType: string, attribute: IAttributeModel) {
        return this.AttributeMetadataService.getMetadata(objectType, attribute.name).staticList;
    }

    public duplicateAttribute(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        if (this.canBeAdded(objectType, attributes, attribute)) {
            this.addAttr(attributes, attribute, attribute.name);
        }
    }

    public displayAddAttributeDialog(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        const addableAttributes = [];
        const md = this.AttributeMetadataService.getAllMetadata(objectType);
        for (const attributeName in md) {
            if (md.hasOwnProperty(attributeName)) {
                const metadata = this.AttributeMetadataService.getMetadata(objectType, attributeName);

                if (!this.isReadOnly(metadata, objectType, attributes) && this.canBeAdded(objectType, attributes, {name: attributeName, value: undefined})) {
                    addableAttributes.push({name: attributeName});
                }
            }
        }

        this.ModalService.openAddAttributeModal(addableAttributes)
            .then((selectedItem: any) => {
                this.addAttr(attributes, attribute, selectedItem.name);
            });
    }

    // Should show bell icon for abuse-c in case value is not specified and objectType is organisation
    public shouldShowBellIcon(attribute: IAttributeModel, objectType: string) {
        return attribute.name === "abuse-c" && !attribute.value && objectType === "organisation";
    }

    // Same like in createModify
    public createRoleForAbuseCAttribute() {
        const maintainers = _.filter(this.attributes, (attr: any) => {
            if (attr.name === "mnt-by") {
                return {name: "mnt-by", value: attr.key};
            }
        });
        this.attribute.$$error = undefined;
        this.attribute.$$success = undefined;
        this.ModalService.openCreateRoleForAbuseCAttribute(this.source, maintainers, this._getPasswordsForRestCall()).then(
            (roleAttrs: any) => {
                this.roleForAbuseC = this.WhoisResources.wrapAndEnrichAttributes("role", roleAttrs);
                this.attribute.value = this.roleForAbuseC.getSingleAttributeOnName("nic-hdl").value;
                this.attribute.$$success = "Role object for abuse-c successfully created";
            }, (error: any) => {
                if (error !== "cancel") { // dismissing modal will hit this function with the string "cancel" in error arg
                    // TODO: pass more specific errors from REST? [RM]
                    this.attribute.$$error = "The role object for the abuse-c attribute was not created";
                }
            },
        );
    }

    public removeAttribute(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        if (this.canBeRemoved(objectType, attributes, attribute)) {
            const foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attr.name === attribute.name && attr.value === attribute.value;
            });
            if (foundIdx > -1) {
                attributes.splice(foundIdx, 1);
                this.AttributeMetadataService.enrich(objectType, attributes);
            }
        }
    }

    public toggleHelp() {
        this.isHelpShown = !this.isHelpShown;
    }

    public getAttributeShortDescription(name: string) {
        return this.WhoisMetaService.getAttributeShortDescription(this.objectType, name);
    }

    // this.attribute.isList = () => {
    //     return this.AttributeMetadataService.isList(this.objectType, this.attribute);
    // }

    public canAddExtraAttributes(objectType: string) {
        return objectType.toUpperCase() !== "PREFIX";
    }

    public canBeAdded(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        if (attribute.name === "reverse-zone") {
            return false;
        }
        // count the attributes which match "attribute"
        const cardinality = this.AttributeMetadataService.getCardinality(objectType, attribute.name);

        if (cardinality.maxOccurs < 0) {
            // undefined or -1 means no limit
            return true;
        }
        // count attributes which match by name
        const matches = _.filter(attributes, (attr: IAttributeModel) => {
            return attr.name === attribute.name;
        });
        return matches.length < cardinality.maxOccurs;
    }

    public canBeRemoved(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        const metadata = this.AttributeMetadataService.getMetadata(objectType, attribute.name);

        if (this.isReadOnly(metadata, objectType, attributes)) {
            return false;
        }

        const cardinality = this.AttributeMetadataService.getCardinality(objectType, attribute.name);
        // check if there"s a limit
        if (cardinality.minOccurs < 1) {
            return true;
        }
        // count the attributes which match "attribute" name
        const matches = _.filter(attributes, (attr: IAttributeModel) => {
            return attr.name === attribute.name;
        });
        return matches.length > cardinality.minOccurs;
    }

    /*
     * Local functions
     */

    // Same like in createModify
    private _getPasswordsForRestCall() {
        const passwords = [];

        if (this.CredentialsService.hasCredentials()) {
            passwords.push(this.CredentialsService.getCredentials().successfulPassword);
        }

        /*
         * For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
         * This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
         */
        if (["route", "route6", "aut-num"].indexOf(this.objectType)) {
            passwords.push("RPSL");
        }
        return passwords;
    }

    private addAttr(attributes: IAttributeModel[], attribute: IAttributeModel, attributeName: string) {
        let foundIdx = -1;
        if (attribute.$$id) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attribute.$$id === attr.$$id;
            });
        }
        // if id wasn't found, find match on name/value.
        if (foundIdx < 0) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attr.name === attribute.name && attr.value === attribute.value;
            });
        }
        if (foundIdx > -1) {
            attributes.splice(foundIdx + 1, 0, {name: attributeName, value: undefined});
            this.AttributeMetadataService.enrich(this.objectType, attributes);
        }
    }

    private valueChanged(objectType: string, attributes: IAttributeModel[]) {
        this.AttributeMetadataService.enrich(objectType, attributes);
    }

    private autocompleteList(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel, userInput: string) {
        if (attribute.name === "status") {
            // special treatment of the status, it need to react on the changes in parent attribute
            return this.statusAutoCompleteList(objectType, attributes, attribute);
        }
        const metadata = this.AttributeMetadataService.getMetadata(objectType, attribute.name);
        if (metadata.refs) {
            return this.refsAutocomplete(attribute, userInput, metadata.refs);
        }
        return [];
    }

    private displayEnumValue(item: any) {
        if (item.key === item.value) {
            return item.key;
        }
        return item.value + " [" + item.key.toUpperCase() + "]";
    }

    private staticList(objectType: string, attribute: IAttributeModel) {
        const metadata = this.AttributeMetadataService.getMetadata(objectType, attribute.name);
        if (metadata.staticList) {
            return this.EnumService.get(this.objectType, attribute.name);
        }
        return [];
    }

    private refsAutocomplete(attribute: IAttributeModel, userInput: any, refs: any): any {
        const utf8Substituted = this.warnForNonSubstitutableUtf8(attribute, userInput);
        if (utf8Substituted && this.isServerLookupKey(refs)) {
            return this.RestService.autocompleteAdvanced(userInput, refs)
                .then((resp: any) => {
                    return this.addNiceAutocompleteName(this.filterBasedOnAttr(resp, attribute.name), attribute.name);
                }, (error) => {
                    // autocomplete error
                    return [];
                });
        } else {
            // No suggestions since not a reference
            return [];
        }
    }

    private statusAutoCompleteList(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        // TODO Add all the parent-child stuff here
        this.attribute.$$statusOptionList = this.EnumService.get(objectType, attribute.name);
        return this.attribute.$$statusOptionList;
    }

    private isServerLookupKey(refs: any) {
        return !(_.isUndefined(refs) || refs.length === 0);
    }

    private warnForNonSubstitutableUtf8(attribute: IAttributeModel, userInput: any) {
        if (!this.CharsetToolsService.isLatin1(userInput)) {
            // see if any chars can be substituted
            const subbedValue = this.CharsetToolsService.replaceSubstitutables(userInput);
            if (!this.CharsetToolsService.isLatin1(subbedValue)) {
                attribute.$$error = "Input contains illegal characters. These will be converted to \"?\"";
                return false;
            } else {
                attribute.$$error = "";
                return true;
            }
        }
        return true;
    }

    private filterBasedOnAttr(suggestions: any, attrName: string) {
        return _.filter(suggestions, (item: any) => {
            if (attrName === "abuse-c") {
                return !_.isEmpty(item["abuse-mailbox"]);
            }
            return true;
        });
    }

    private addNiceAutocompleteName(items: any, attrName: string) {
        return _.map(items, (item: any) => {
            let name = "";
            let separator = " / ";
            if (item.type === "person") {
                name = item.person;
            } else if (item.type === "role") {
                name = item.role;
                if (attrName === "abuse-c" && typeof item["abuse-mailbox"] === "string") {
                    name = name.concat(separator + item["abuse-mailbox"]);
                }
            } else if (item.type === "aut-num") {
                // When we"re using an as-name then we"ll need 1st descr as well (pivotal#116279723)
                if (angular.isArray(item.descr) && item.descr.length) {
                    name = [item["as-name"], separator, item.descr[0]].join("");
                } else {
                    name = item["as-name"];
                }
            } else if (typeof item["org-name"] === "string") {
                name = item["org-name"];
            } else if (angular.isArray(item.descr)) {
                name = item.descr.join("");
            } else if (angular.isArray(item.owner)) {
                name = item.owner.join("");
            } else {
                separator = "";
            }
            item.readableName = this.$sce.trustAsHtml((item.key + separator + name).replace(/</g, "&lt;").replace(/>/g, "&gt;"));
            return item;
        });
    }

    private isReadOnly(metadata: any, objectType: string, attributes: IAttributeModel[]) {
        return typeof metadata.readOnly === "function" ?
            metadata.readOnly(objectType, attributes) : metadata.readOnly;
    }
}

angular.module("dbWebApp")
    .component("attributeRenderer", {
        bindings: {
            attribute: "=",
            attributes: "=",
            idx: "=",
            objectType: "=",
            source: "=",
        },
        controller: AttributeController,
        templateUrl: "scripts/whoisObject/attribute-renderer.html",
});
