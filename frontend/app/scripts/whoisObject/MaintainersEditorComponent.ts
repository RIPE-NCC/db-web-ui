class MaintainersEditorController {
    public static $inject = [
        "$log",
        "AlertService",
        "AttributeMetadataService",
        "CredentialsService",
        "MessageStore",
        "MntnerService",
        "RestService",
        "WebUpdatesCommons",
        "JsUtilService"];

    // Input
    public ngModel: IWhoisObjectModel;
    public authenticationFailedClbk: () => void;
    public updateMntnersClbk: (maintainers: any) => void;

    // Parts of the model used in template
    public attributes: IAttributeModel[];
    public objectType: string;
    public objectName: string;

    // Underlying mntner model
    public mntners: {
        sso: IMntByModel[],
        object: IMntByModel[];
        alternatives: IMntByModel[];
        objectOriginal: IMntByModel[];
    };

    // Interface control
    public restCallInProgress = false;
    public message: {
        text: string;
        type: string;
    };
    public isMntHelpShown = false;

    private source: string;

    constructor(private $log: angular.ILogService,
                private AlertService: any,
                private AttributeMetadataService: any,
                private CredentialsService: any,
                private MessageStore: any,
                private MntnerService: MntnerService,
                private RestService: RestService,
                private WebUpdatesCommons: any,
                private jsUtils: JsUtilService) {

        this.source = this.ngModel.source.id;
        this.attributes = this.ngModel.attributes.attribute;
        this.objectType = this.attributes[0].name;
        this.objectName = this.attributes[0].value;

        this.mntners = {
            alternatives: [],
            object: [],
            objectOriginal: [],
            sso: [],
        };

        if (this.isModifyMode()) {
            this.initModifyMode();
        } else {
            this.initCreateMode();
        }
        if (this.updateMntnersClbk) {
            this.updateMntnersClbk({mntners: this.mntners});
        }
    }

    public onMntnerAdded(item: IMntByModel): void {
        // enrich with new-flag
        this.mntners.object = this.MntnerService.enrichWithNewStatus(this.mntners.objectOriginal, this.mntners.object);

        this.mergeMaintainers(this.attributes, {name: "mnt-by", value: item.key});

        if (this.MntnerService.needsPasswordAuthentication(this.mntners.sso, this.mntners.objectOriginal,
                this.mntners.object)) {
            this.performAuthentication();
        }
        this.AttributeMetadataService.enrich(this.objectType, this.attributes);
        this.ngModel.attributes.attribute = this.attributes;
        if (this.updateMntnersClbk) {
            this.updateMntnersClbk({mntners: this.mntners});
        }
    }

    public onMntnerRemoved(item: IMntByModel): void {

        // don't remove if it's the last one -- just empty it
        const objectMntBys = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name === "mnt-by";
        });
        if (objectMntBys.length > 1) {
            _.remove(this.attributes, (i: IAttributeModel) => {
                return i.name === "mnt-by" && i.value === item.key;
            });
        } else {
            objectMntBys[0].value = "";
        }
        this.AttributeMetadataService.enrich(this.objectType, this.attributes);
        this.ngModel.attributes.attribute = this.attributes;
        if (this.updateMntnersClbk) {
            this.updateMntnersClbk({mntners: this.mntners});
        }

    }

    public isLirObject() {
        return this.isAllocation() || !!_.find(this.attributes, {name: "org-type", value: "LIR"});
    }

    public isModifyWithSingleMntnerRemaining() {
        return this.isModifyMode() && this.mntners.object.length === 1;
    }

    /**
     * Callback from html to support typeahead selection
     *
     * @param query
     */
    public mntnerAutocomplete(query: string) {
        // need to typed characters
        this.RestService.autocomplete("mnt-by", query, true, ["auth"]).then((data: IMntByModel[]) => {
                // mark new
                this.mntners.alternatives = this.MntnerService.stripNccMntners(this.MntnerService.enrichWithNewStatus(
                    this.mntners.objectOriginal, this.filterAutocompleteMntners(this.enrichWithMine(data))), true);
            },
        );
    }

    // hot-wire the MntnerService functions
    public hasMd5 = (mntner: IMntByModel) => this.MntnerService.hasMd5(mntner);
    public hasPgp = (mntner: IMntByModel) => this.MntnerService.hasPgp(mntner);
    public hasSSo = (mntner: IMntByModel) => this.MntnerService.hasSSo(mntner);
    public isRemovable = (mntnerKey: string) => this.MntnerService.isRemovable(mntnerKey);

    private isAllocation() {
        const allocationStatuses = ["ALLOCATED PA", "ALLOCATED PI", "ALLOCATED UNSPECIFIED", "ALLOCATED-BY-RIR"];
        for (const attr of this.attributes) {
            if (attr.name.trim() === "status") {
                return attr.value && _.includes(allocationStatuses, attr.value.trim());
            }
        }
        return false;
    }

    private performAuthentication(): void {
        const authParams = {
            failureClbk: () => this.navigateAway(),
            isLirObject: this.isLirObject(),
            maintainers: this.mntners,
            object: {
                name: this.objectName,
                source: this.source,
                type: this.objectType,
            },
            operation: this.isModifyMode() ? "Modify" : "Create",
            successClbk: () => this.onSuccessfulAuthentication(),
        };
        this.WebUpdatesCommons.performAuthentication(authParams);
    }

    private navigateAway(): void {
        if (!this.isModifyMode()) {
            for (const mnt of this.mntners.object) {
                this.onMntnerRemoved(mnt);
            }
            this.mntners.object = [];
        }
        if (this.authenticationFailedClbk) {
            this.authenticationFailedClbk();
        }
    }

    private onSuccessfulAuthentication(): void {
        this.$log.debug("MaintainersEditorController.onSuccessfulAuthentication", arguments);
    }

    private handleSsoResponse(results: IMntByModel[]): void {
        this.restCallInProgress = false;
        this.mntners.sso = results;
        if (this.mntners.sso.length > 0) {
            this.mntners.objectOriginal = [];
            // populate ui-select box with sso-mntners
            this.mntners.object = angular.copy(this.mntners.sso);
            // copy mntners to attributes (for later submit)
            const mntnerAttrs = this.mntners.sso.map((i: IMntByModel) => {
                return {
                    name: "mnt-by",
                    value: i.key,
                };
            });
            this.mergeMaintainers(this.attributes, mntnerAttrs);
            this.AttributeMetadataService.enrich(this.objectType, this.attributes);
        }
    }

    private handleSsoResponseError(): void {
        this.restCallInProgress = false;
        this.message = {
            text: "Error fetching maintainers associated with this SSO account",
            type: "error",
        };
    }

    private mergeMaintainers(attrs: IAttributeModel[], maintainers: any): void {
        if (this.jsUtils.typeOf(attrs) !== "array") {
            throw new TypeError("attrs must be an array in mergeMaintainers");
        }
        let i;
        let lastIdxOfType = _.findLastIndex(attrs, (item) => {
            return item.name === "mnt-by";
        });
        if (lastIdxOfType < 0) {
            lastIdxOfType = attrs.length;
        } else if (!attrs[lastIdxOfType].value) {
            attrs.splice(lastIdxOfType, 1);
        }
        if (this.jsUtils.typeOf(maintainers) === "object") {
            attrs.splice(lastIdxOfType, 0, maintainers);
        } else {
            for (i = 0; i < maintainers.length; i++) {
                attrs.splice(lastIdxOfType + i, 0, maintainers[i]);
            }
        }
    }

    private isModifyMode(): boolean {
        const createdAttr = _.find(this.attributes, (attr: IAttributeModel) => {
            return attr.name.toUpperCase() === "CREATED";
        });
        return createdAttr && typeof createdAttr.value === "string" && createdAttr.value.length > 0;
    }

    private initCreateMode() {
        this.RestService.fetchMntnersForSSOAccount().then((results: IMntByModel[]) => {
            this.handleSsoResponse(results);
        }, () => {
            this.handleSsoResponseError();
        });
    }

    private initModifyMode() {
        this.RestService.fetchMntnersForSSOAccount().then((ssoResult: IMntByModel[]) => {
                this.restCallInProgress = false;

                // store mntners for SSO account
                this.mntners.sso = ssoResult;
                this.$log.debug("maintainers.sso:", this.mntners.sso);

                // this is where we must authenticate against
                this.mntners.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);

                // starting point for further editing
                this.mntners.object = this.extractEnrichMntnersFromObject(this.attributes);

                // fetch details of all selected maintainers concurrently
                this.restCallInProgress = true;
                this.RestService.detailsForMntners(this.mntners.object).then((result: any) => {
                    this.restCallInProgress = false;

                    this.mntners.objectOriginal = _.flatten(result) as IMntByModel[];
                    this.$log.debug("mntners-object-original:", this.mntners.objectOriginal);

                    // of course none of the initial ones are new
                    this.mntners.object = this.MntnerService.enrichWithNewStatus(this.mntners.objectOriginal,
                        _.flatten(result));
                    this.$log.debug("mntners-object:", this.mntners.object);

                    if (this.MntnerService.needsPasswordAuthentication(
                            this.mntners.sso, this.mntners.objectOriginal, this.mntners.object)) {
                        this.performAuthentication();
                    }
                }, (error: any) => {
                    this.restCallInProgress = false;
                    this.$log.error("Error fetching sso-mntners details", error);
                    this.AlertService.setGlobalError("Error fetching maintainer details");
                });
                // now let's see if there are any read-only restrictions on these attributes. There is if any of
                // these are true:
                //
                // * this is an inet(6)num and it has a "sponsoring-org" attribute which refers to an LIR
                // * this is an inet(6)num and it has a "org" attribute which refers to an LIR
                // * this is an organisation with an "org-type: LIR" attribute and attribute.name is
                // address|fax|e-mail|phone
            },
        ).catch((error: any) => {
                this.restCallInProgress = false;
                try {
                    const whoisResources = error.data;
                    // this.attributes = _wrapAndEnrichResources(this.objectType, error.data);
                    this.AlertService.setErrors(whoisResources);
                } catch (e) {
                    this.$log.error("Error fetching sso-mntners for SSO:", error);
                    this.AlertService.setGlobalError("Error fetching maintainers associated with this SSO account");
                }
            },
        );
    }

    private extractEnrichMntnersFromObject(attributes: IAttributeModel[]): IMntByModel[] {
        // get mntners from response
        const mntnersInObject = attributes.filter((i) => {
            return i.name === "mnt-by";
        });

        // determine if mntner is mine
        const selected: IMntByModel[] = mntnersInObject.map((mntnerAttr: {value: string}) => {
            let isMine = false;
            for (const mnt of this.mntners.sso) {
                if (mnt.key === mntnerAttr.value) {
                    isMine = true;
                    break;
                }
            }
            return {
                key: mntnerAttr.value,
                mine: isMine,
                type: "mntner",
            };
        }) as IMntByModel[];
        return selected;
    }

    private enrichWithMine(mntners: IMntByModel[]) {
        return mntners.map((mntner) => {
            // search in selected list
            mntner.mine = !!this.MntnerService.isMntnerOnlist(this.mntners.sso, mntner);
            return mntner;
        });
    }

    private filterAutocompleteMntners(mntners: IMntByModel[]) {
        return mntners.filter((mntner) => {
            return !this.MntnerService.isNccMntner(mntner.key)
                && !this.MntnerService.isMntnerOnlist(this.mntners.object, mntner);
        });
    }
}

angular.module("dbWebApp").component("maintainersEditor", {
    bindings: {
        authenticationFailedClbk: "&?",
        ngModel: "=",
        updateMntnersClbk: "&?",
    },
    controller: MaintainersEditorController,
    templateUrl: "scripts/whoisObject/maintainers-editor.html",
});
