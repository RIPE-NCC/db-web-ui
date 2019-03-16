interface ITextObject {
    rpsl?: any;
    source: string;
    type: string;
    name?: string;
    objects?: any;
}
class TextCreateController {
    public static $inject = ["$stateParams", "$state", "$resource", "$log", "$q", "$window",
        "WhoisResources", "WhoisMetaService", "RestService", "AlertService", "ErrorReporterService", "MessageStore",
        "RpslService", "TextCommonsService", "PreferenceService", "MntnerService"];

    public restCallInProgress: boolean = false;
    public object: ITextObject = {
        source: "",
        type: "",
    };
    public mntners: any;
    public name: string;
    public override: string;
    public passwords: string[];

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public $resource: any,
                public $log: angular.ILogService,
                public $q: ng.IQService,
                public $window: any,
                public WhoisResources: WhoisResources,
                public WhoisMetaService: WhoisMetaService,
                public RestService: RestService,
                public AlertService: AlertService,
                public ErrorReporterService: ErrorReporterService,
                public MessageStore: MessageStore,
                public RpslService: RpslService,
                public TextCommonsService: TextCommonsService,
                public PreferenceService: PreferenceService,
                public MntnerService: MntnerService) {

        this.initialisePage();
    }

    public initialisePage() {

        this.restCallInProgress = false;

        this.AlertService.clearErrors();

        // extract parameters from the url
        // this.object = {};
        this.object.source = this.$stateParams.source;
        this.object.type = this.$stateParams.objectType;
        if (!_.isUndefined(this.$stateParams.rpsl)) {
            this.object.rpsl = decodeURIComponent(this.$stateParams.rpsl);
        }
        const redirect = !this.$stateParams.noRedirect;

        // maintainers associated with this SSO-account
        this.mntners = {};
        this.mntners.sso = [];

        this.$log.debug("TextCreateComponent: Url params:" +
            " object.source:" + this.object.source +
            ", object.type:" + this.object.type +
            ", noRedirect:" + !redirect);

        if (this.PreferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }

        if (_.isUndefined(this.object.rpsl)) {
            this.prepopulateRpsl();
        }
    }

    public submit() {
        this.AlertService.clearErrors();

        this.$log.debug("rpsl:" + this.object.rpsl);

        // parse
        const objects = this.RpslService.fromRpsl(this.object.rpsl);
        if (objects.length > 1) {
            this.AlertService.setGlobalError("Only a single object is allowed");
            return;
        }
        this.passwords = objects[0].passwords;
        this.override = objects[0].override;
        const attributes = this.TextCommonsService.uncapitalize(objects[0].attributes);
        this.$log.debug("attributes:" + JSON.stringify(attributes));

        if (!this.TextCommonsService.validate(this.object.type, attributes)) {
            return;
        }

        // if inet(6)num, find the parent and get some auth for that
        if (["inetnum", "inet6num"].indexOf(this.object.type) > -1) {
            const inetnumAttr = _.find(attributes, (attr: any) => {
                return this.object.type === attr.name && attr.value;
            });
            const sourceAttr = _.find(attributes, (attr: any) => {
                return "source" === attr.name && attr.value;
            });
            if (inetnumAttr && sourceAttr) {
                this.restCallInProgress = true;
                this.RestService.fetchParentResource(inetnumAttr.name, inetnumAttr.value)
                    .get((result: any) => {
                    let parent;
                    if (result && result.objects && angular.isArray(result.objects.object)) {
                        parent = result.objects.object[0];
                        if (parent.attributes && angular.isArray(parent.attributes.attribute)) {
                            const parentObject = this.WhoisResources.wrapAttributes(parent.attributes.attribute);
                            this.MntnerService.getAuthForObjectIfNeeded(parentObject, this.mntners.sso, "Modify", sourceAttr.value.trim(), inetnumAttr.name, this.name)
                                .then(() => {
                                    this.doCreate(attributes, inetnumAttr.name);
                                }, (error) => {
                                    this.restCallInProgress = false;
                                    this.$log.error("MntnerService.getAuthForObjectIfNeeded rejected authorisation: ", error);
                                    this.AlertService.addGlobalError("Failed to authenticate parent resource");
                                },
                            );
                        }
                    }
                }, () => {
                    // if we cannot find a parent, do not show the auth popup
                    this.doCreate(attributes, inetnumAttr.name);
                });
            }
        } else {
            this.TextCommonsService.authenticate("Create", this.object.source, this.object.type, undefined, this.mntners.sso,
                attributes, this.passwords, this.override)
                .then((authenticated: any) => {
                    this.$log.debug("Authenticated successfully:" + authenticated);
                    // combine all passwords
                    this.doCreate(attributes, this.object.type);
                }, (authenticated: any) => {
                    this.$log.error("Authentication failure:" + authenticated);
                },
            );
        }
    }

    public cancel() {
        if (this.$window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.$state.transitionTo("webupdates.select");
        }
    }

    public switchToWebMode() {
        this.$log.debug("Switching to web-mode");

        this.PreferenceService.setWebMode();

        this.$state.transitionTo("webupdates.create", {
            objectType: this.object.type,
            source: this.object.source,
        });
    }

    private prepopulateRpsl() {
        const attributesOnObjectType = this.WhoisMetaService.getAllAttributesOnObjectType(this.object.type);
        if (_.isEmpty(attributesOnObjectType)) {
            this.$log.error("Object type " + this.object.type + " was not found");
            this.$state.transitionTo("notFound");
            return;
        }

        this.enrichAttributes(this.WhoisResources.wrapAndEnrichAttributes(this.object.type, attributesOnObjectType));
    }

    private enrichAttributes(attributes: any) {
        this.TextCommonsService.enrichWithDefaults(this.object.source, this.object.type, attributes);
        this.enrichAttributesWithSsoMntners(attributes)
            .then((attrs: any) => {
                this.TextCommonsService.capitaliseMandatory(attrs);
                const obj: IRpslObject = {
                    attributes: attrs,
                    override: this.override,
                    passwords: this.passwords,
                };
                this.object.rpsl = this.RpslService.toRpsl(obj);
            },
        );

        return attributes;
    }

    private enrichAttributesWithSsoMntners(attributes: any) {
        const deferredObject = this.$q.defer();

        this.restCallInProgress = true;
        this.RestService.fetchMntnersForSSOAccount()
            .then((ssoMntners: any) => {
                this.restCallInProgress = false;

                this.mntners.sso = ssoMntners;

                const enrichedAttrs = this.addSsoMntnersAsMntBy(attributes, ssoMntners);
                deferredObject.resolve(enrichedAttrs);

            }, (error: any) =>  {
                this.restCallInProgress = false;

                this.$log.error("Error fetching mntners for SSO:" + JSON.stringify(error));
                this.AlertService.setGlobalError("Error fetching maintainers associated with this SSO account");

                deferredObject.resolve(attributes);
            },
        );

        return deferredObject.promise;
    }

    private addSsoMntnersAsMntBy(attributes: any, mntners: any) {
        // keep existing
        if (mntners.length === 0) {
            return attributes;
        }

        // merge mntners into json-attributes
        const mntnersAsAttrs = _.map(mntners, (item: any) => {
            return {name: "mnt-by", value: item.key};
        });
        const attrsWithMntners = attributes.addAttrsSorted("mnt-by", mntnersAsAttrs);

        // strip mnt-by without value from attributes
        return _.filter(attrsWithMntners, (item: any) => {
            return !(item.name === "mnt-by" && _.isUndefined(item.value));
        });
    }

    private doCreate(attributes: any, objectType: string) {
        const combinedPaswords = _.union(this.passwords, this.TextCommonsService.getPasswordsForRestCall(objectType));
        attributes = this.TextCommonsService.stripEmptyAttributes(attributes);
        // rest-POST to server
        this.restCallInProgress = true;
        this.RestService.createObject(this.object.source, objectType, this.WhoisResources.turnAttrsIntoWhoisObject(attributes), combinedPaswords, this.override, true)
            .then((result: any) => {
                this.restCallInProgress = false;
                const whoisResources = result;
                this.MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                this.TextCommonsService.navigateToDisplayPage(this.object.source, objectType, whoisResources.getPrimaryKey(), "Create");
            }, (error: any) => {
                this.restCallInProgress = false;
                const whoisResources = error.data;
                this.AlertService.setAllErrors(whoisResources);
                if (!_.isEmpty(whoisResources.getAttributes())) {
                    this.ErrorReporterService.log("TextCreate", objectType, this.AlertService.getErrors(), whoisResources.getAttributes());
                }
            },
        );
    }
}

angular.module("textUpdates")
    .component("textCreate", {
        controller: TextCreateController,
        templateUrl: "./create.html",
    });
