class CreatePersonMntnerPairController {

    public static $inject = ["$state", "$log", "Properties",
        "WhoisResources", "WhoisMetaService", "AlertService", "UserInfoService", "RestService", "MessageStore", "ErrorReporterService", "LinkService"];

    public submitInProgress: boolean;
    public source: string;
    public personAttributes: any;
    public mntnerAttributes: any;
    public objectType: string;

    constructor(private $state: ng.ui.IStateService,
                private $log: angular.ILogService,
                private Properties: IProperties,
                private WhoisResources: any,
                private WhoisMetaService: WhoisMetaService,
                private AlertService: AlertService,
                private UserInfoService: UserInfoService,
                private RestService: RestService,
                private MessageStore: MessageStore,
                private ErrorReporterService: ErrorReporterService,
                private LinkService: LinkService) {

        this.submitInProgress = false;

        this.AlertService.clearErrors();

        this.source = this.Properties.SOURCE;

        this.personAttributes = this.WhoisResources.wrapAndEnrichAttributes("person",
            this.WhoisMetaService.getMandatoryAttributesOnObjectType("person"));
        this.personAttributes.setSingleAttributeOnName("nic-hdl", "AUTO-1");
        this.personAttributes.setSingleAttributeOnName("source", this.source);

        this.mntnerAttributes = this.WhoisResources.wrapAndEnrichAttributes("mntner",
            this.WhoisMetaService.getMandatoryAttributesOnObjectType("mntner"));
        this.mntnerAttributes.setSingleAttributeOnName("admin-c", "AUTO-1");
        this.mntnerAttributes.setSingleAttributeOnName("source", this.source);

        // kick off ajax-call to fetch email address of logged-in user
        this.UserInfoService.getUserOrgsAndRoles().then((result) => {
                this.mntnerAttributes.setSingleAttributeOnName("auth", "SSO " + result.user.username);
                this.mntnerAttributes.setSingleAttributeOnName("upd-to", result.user.username);
            }, () => {
                this.AlertService.setGlobalError("Error fetching SSO information");
            },
        );
    }

    private submit() {

        this.populateMissingAttributes();

        const mntner = this.mntnerAttributes.getSingleAttributeOnName("mntner");
        if (!_.isUndefined(mntner.value)) {
            this.personAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
            this.mntnerAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
        }

        if (!this.validateForm()) {
            this.ErrorReporterService.log("Create", "person", this.AlertService.getErrors(), this.personAttributes);
            this.ErrorReporterService.log("Create", "mntner", this.AlertService.getErrors(), this.mntnerAttributes);

        } else {
            this.AlertService.clearErrors();

            this.submitInProgress = true;
            this.RestService.createPersonMntner(this.source,
                this.WhoisResources.turnAttrsIntoWhoisObjects([this.personAttributes, this.mntnerAttributes])).then((resp) => {
                    this.submitInProgress = false;

                    const personUid = this.addObjectOfTypeToCache(resp, "person", "nic-hdl");
                    const mntnerName = this.addObjectOfTypeToCache(resp, "mntner", "mntner");

                    this.navigateToDisplayPage(this.source, personUid, mntnerName);

                }, (error) => {
                    this.submitInProgress = false;
                    const whoisResources = error.data;

                    this.validateForm();
                    this.AlertService.addErrors(whoisResources);
                    this.AlertService.populateFieldSpecificErrors("person", this.personAttributes, whoisResources);
                    this.AlertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, whoisResources);

                    this.ErrorReporterService.log("Create", "person", this.AlertService.getErrors(), this.personAttributes);
                    this.ErrorReporterService.log("Create", "mntner", this.AlertService.getErrors(), this.mntnerAttributes);
                },
            );
        }
    }

    private populateMissingAttributes() {
        const mntner = this.mntnerAttributes.getSingleAttributeOnName("mntner");
        if (!_.isUndefined(mntner.value)) {
            this.personAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
            this.mntnerAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
        }
    }

    private cancel() {
        if (window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.$state.transitionTo("webupdates.select");
        }
    }

    private fieldVisited(objectName: string, attr: IAttributeModel) {
        this.$log.info("fieldVisited:" + JSON.stringify(attr));
        if (attr.$$meta.$$primaryKey === true) {
            attr.$$error = "";
            this.RestService.autocomplete(attr.name, attr.value, true, []).then((data: any) => {
                    const found = _.find(data, (item: any) => {
                        if (item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase()) {
                            return item;
                        }
                    });
                    if (!_.isUndefined(found)) {
                        attr.$$error = attr.name + " " + this.LinkService.getModifyLink(this.source, attr.name, found.key) + " already exists";
                    }
                },
            );
        }
    }

    private validateForm() {
        const personValid = this.personAttributes.validate();
        const mntnerValid = this.mntnerAttributes.validate();
        return personValid && mntnerValid;
    }

    private isFormValid() {
        this.populateMissingAttributes();
        const personValid = this.personAttributes.validateWithoutSettingErrors();
        const mntnerValid = this.mntnerAttributes.validateWithoutSettingErrors();
        return personValid && mntnerValid;
    }

    private navigateToDisplayPage(source: string, personName: string, mntnerName: string) {
        this.$state.transitionTo("webupdates.displayPersonMntnerPair", {
            mntner: mntnerName,
            person: personName,
            source,
        });
    }

    private addObjectOfTypeToCache(whoisResources: any, objectType: string, keyFieldName: string) {
        let uid;
        const attrs = this.WhoisResources.getAttributesForObjectOfType(whoisResources, objectType);
        if (attrs.length > 0) {
            uid = this.WhoisResources.wrapAttributes(attrs).getSingleAttributeOnName(keyFieldName).value;
            this.MessageStore.add(uid, this.WhoisResources.turnAttrsIntoWhoisObject(attrs));
        }
        return uid;
    }

    private getAttributeDescription(attrName: string) {
        return this.WhoisMetaService.getAttributeDescription(this.objectType, attrName);
    }

    private getAttributeSyntax(attrName: string) {
        return this.WhoisMetaService.getAttributeSyntax(this.objectType, attrName);
    }
}

angular.module("webUpdates")
    .component("createPersonMntnerPair", {
        controller: CreatePersonMntnerPairController,
        templateUrl: "scripts/updates/web/createPersonMntnerPair.html",
    });
