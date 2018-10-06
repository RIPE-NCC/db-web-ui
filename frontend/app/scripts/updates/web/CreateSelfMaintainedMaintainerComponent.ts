class CreateSelfMaintainedMaintainerController {
    public static $inject = ["$state", "$log", "$stateParams",
        "WhoisResources", "WhoisMetaService", "AlertService", "UserInfoService", "RestService", "MessageStore", "ErrorReporterService", "LinkService"];

    public submitInProgress: boolean = false;
    public admincDescription: any;
    public admincSyntax: any;
    public adminC: any;
    public uiSelectTemplateReady: any;
    public maintainerAttributes: any;
    public objectType: string;
    public source: string;
    private readonly MNT_TYPE: string = "mntner";

    constructor(private $state: ng.ui.IStateService,
                private $log: angular.ILogService,
                private $stateParams: ng.ui.IStateParamsService,
                private WhoisResources: any,
                private WhoisMetaService: WhoisMetaService,
                private AlertService: AlertService,
                private UserInfoService: UserInfoService,
                private RestService: RestService,
                private MessageStore: MessageStore,
                private ErrorReporterService: ErrorReporterService,
                private LinkService: LinkService) {

        this.AlertService.clearErrors();

        this.admincDescription = WhoisMetaService.getAttributeDescription(this.objectType, "admin-c");
        this.admincSyntax = WhoisMetaService.getAttributeSyntax(this.objectType, "admin-c");

        this.adminC = {
            alternatives: [],
            object: [],
        };

        // workaround for problem with order of loading ui-select fragments
        this.uiSelectTemplateReady = false;
        this.RestService.fetchUiSelectResources()
            .then(() => {
            this.uiSelectTemplateReady = true;
        });

        this.maintainerAttributes = this.WhoisResources.wrapAndEnrichAttributes(this.MNT_TYPE, WhoisMetaService.getMandatoryAttributesOnObjectType(this.MNT_TYPE));

        this.source = $stateParams.source;
        this.maintainerAttributes.setSingleAttributeOnName("source", this.source);

        if (!_.isUndefined($stateParams.admin)) {
            const item = {type: "person", key: $stateParams.admin};
            this.adminC.object.push(item);
            this.onAdminCAdded(item);
        }

        // kick off ajax-call to fetch email address of logged-in user
        UserInfoService.getUserOrgsAndRoles()
            .then((result: any) => {
                this.maintainerAttributes.setSingleAttributeOnName("upd-to", result.user.username);
                this.maintainerAttributes.setSingleAttributeOnName("auth", "SSO " + result.user.username);
            }, () => {
                this.AlertService.setGlobalError("Error fetching SSO information");
            },
        );
    }

    public submit() {
        this.populateMissingAttributes();

        this.$log.info("submit attrs:" + JSON.stringify(this.maintainerAttributes));

        this.maintainerAttributes.clearErrors();
        if (!this.maintainerAttributes.validate()) {
            this.ErrorReporterService.log("Create", this.MNT_TYPE, this.AlertService.getErrors(), this.maintainerAttributes);
        } else {
            this.createObject();
        }
    }

    public isFormValid() {
        this.populateMissingAttributes();
        return this.maintainerAttributes.validateWithoutSettingErrors();
    }

    private populateMissingAttributes() {
        this.maintainerAttributes = this.WhoisResources.wrapAttributes(this.maintainerAttributes);

        const mntner = this.maintainerAttributes.getSingleAttributeOnName(this.MNT_TYPE);
        this.maintainerAttributes.setSingleAttributeOnName("mnt-by", mntner.value);
    }

    private cancel() {
        if (window.confirm("Are you sure?")) {
            this.$state.transitionTo("webupdates.select");
        }
    }

    private fieldVisited(attr: any) {
        this.RestService.autocomplete(attr.name, attr.value, true, [])
            .then((data: any) => {
                if (_.any(data, (item: any) => {
                    return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                })) {
                    attr.$$error = attr.name + " " + this.LinkService.getModifyLink(this.source, attr.name, attr.value) + " already exists";
                } else {
                    attr.$$error = "";
                }
            },
        );
    }

    private createObject() {
        this.maintainerAttributes = this.maintainerAttributes.removeNullAttributes();

        const obj = this.WhoisResources.turnAttrsIntoWhoisObject(this.maintainerAttributes);

        this.submitInProgress = true;
        this.RestService.createObject(this.source, this.MNT_TYPE, obj, null)
            .then((resp: any) => {
                    this.submitInProgress = false;

                    const primaryKey = resp.getPrimaryKey();
                    this.MessageStore.add(primaryKey, resp);

                    this.$state.transitionTo("webupdates.display", {source: this.source, objectType: this.MNT_TYPE, name: primaryKey});
                }, (error: any) => {
                    this.submitInProgress = false;

                    this.AlertService.populateFieldSpecificErrors(this.MNT_TYPE, this.maintainerAttributes, error.data);
                    this.AlertService.showWhoisResourceErrors(this.MNT_TYPE, error.data);
                    this.ErrorReporterService.log("Create", this.MNT_TYPE, this.AlertService.getErrors(), this.maintainerAttributes);
                },
            );
    }

    private adminCAutocomplete(query: any) {
        this.RestService.autocomplete("admin-c", query, true, ["person", "role"]).then(
            (data: any) => {
                this.$log.debug("autocomplete success:" + JSON.stringify(data));
                // mark new
                this.adminC.alternatives = this.stripAlreadySelected(data);
            }, (error: any) => {
                this.$log.error("autocomplete error:" + JSON.stringify(error));
            },
        );
    }

    private stripAlreadySelected(adminC: any) {
        return _.filter(adminC, (aC: any) => {
            return !this.adminC.object !== aC;
        });
    }

    private hasAdminC() {
        return this.adminC.object.length > 0;
    }

    private onAdminCAdded(item: any) {
        this.$log.debug("onAdminCAdded:" + JSON.stringify(item));
        this.maintainerAttributes = this.maintainerAttributes.addAttributeAfterType({name: "admin-c", value: item.key}, {name: "admin-c"});
        this.maintainerAttributes = this.WhoisMetaService.enrichAttributesWithMetaInfo(this.MNT_TYPE, this.maintainerAttributes);
        this.maintainerAttributes = this.WhoisResources.wrapAttributes(this.maintainerAttributes);
    }

    private onAdminCRemoved(item: any) {
        this.$log.debug("onAdminCRemoved:" + JSON.stringify(item));
        _.remove(this.maintainerAttributes, (i: any) => {
            return i.name === "admin-c" && i.value === item.key;
        });
    }

    private getAttributeDescription(attrName: string) {
        return this.WhoisMetaService.getAttributeDescription(this.objectType, attrName);
    }

    private getAttributeSyntax(attrName: string) {
        return this.WhoisMetaService.getAttributeSyntax(this.objectType, attrName);
    }
}

angular.module("webUpdates")
    .component("createSelfMaintainedMaintainerComponent", {
        controller: CreateSelfMaintainedMaintainerController,
        templateUrl: "scripts/updates/web/createSelfMaintainedMaintainer.html",
    });
