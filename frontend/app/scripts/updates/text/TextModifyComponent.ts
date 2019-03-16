class TextModifyController {
    public static $inject = ["$stateParams", "$state", "$resource", "$log", "$q", "$window",
        "WhoisResources", "RestService", "AlertService", "ErrorReporterService", "MessageStore", "RpslService",
        "TextCommonsService", "CredentialsService", "PreferenceService"];

    public restCallInProgress: boolean = false;
    public noRedirect: boolean = false;
    public object: ITextObject = {
        source: "",
        type: "",
    };
    public mntners: any;
    public name: string;
    public override: string;
    public passwords: string[];

    constructor(
        public $stateParams: ng.ui.IStateParamsService,
        public $state: ng.ui.IStateService,
        public $resource: any,
        public $log: angular.ILogService,
        public $q: ng.IQService,
        public $window: any,
        public WhoisResources: WhoisResources,
        public RestService: RestService,
        public AlertService: AlertService,
        public ErrorReporterService: ErrorReporterService,
        public MessageStore: MessageStore,
        public RpslService: RpslService,
        public TextCommonsService: TextCommonsService,
        public CredentialsService: CredentialsService,
        public PreferenceService: PreferenceService) {

        this.initialisePage();
    }

    public initialisePage() {
        this.AlertService.clearErrors();

        // extract parameters from the url
        this.object.source = this.$stateParams.source;
        this.object.type = this.$stateParams.objectType;
        this.object.name = decodeURIComponent(this.$stateParams.name);
        if (!_.isUndefined(this.$stateParams.rpsl)) {
            this.object.rpsl = decodeURIComponent(this.$stateParams.rpsl);
        }
        const redirect = !this.$stateParams.noRedirect;

        this.mntners = {};
        this.mntners.sso = [];
        this.passwords = [];

        this.$log.debug("TextModifyController: Url params:" +
            " object.source:" + this.object.source +
            ", object.type:" + this.object.type +
            ", object.name:" + this.object.name +
            ", noRedirect:" + this.noRedirect);

        if (this.PreferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }

        if (_.isUndefined(this.object.rpsl)) {
            this.fetchAndPopulateObject();
        }
    }

    public submit() {
        const objects = this.RpslService.fromRpsl(this.object.rpsl);
        if (objects.length > 1) {
            this.AlertService.setGlobalError("Only a single object is allowed");
            return;
        }

        this.passwords = objects[0].passwords;
        this.override = objects[0].override;
        let attributes = this.TextCommonsService.uncapitalize(objects[0].attributes);

        this.$log.debug("attributes:" + JSON.stringify(attributes));
        if (!this.TextCommonsService.validate(this.object.type, attributes)) {
            return;
        }

        if (this.CredentialsService.hasCredentials()) {
            // todo: prevent duplicate password
            this.passwords.push(this.CredentialsService.getCredentials().successfulPassword);
        }

        this.TextCommonsService.authenticate("Modify", this.object.source, this.object.type, this.object.name, this.mntners.sso, attributes,
            this.passwords, this.override)
            .then(() => {
                this.$log.info("Successfully authenticated");

                // combine all passwords
                const combinedPasswords = _.union(this.passwords, this.TextCommonsService.getPasswordsForRestCall(this.object.type));

                attributes = this.TextCommonsService.stripEmptyAttributes(attributes);

                this.restCallInProgress = true;
                this.RestService.modifyObject(this.object.source, this.object.type, this.object.name,
                    this.WhoisResources.turnAttrsIntoWhoisObject(attributes), combinedPasswords, this.override, true)
                    .then((whoisResources: any) => {
                        this.restCallInProgress = false;

                        this.MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        this.navigateToDisplayPage(this.object.source, this.object.type, whoisResources.getPrimaryKey(), "Modify");

                    }, (errorWhoisResources: any) => {
                        this.restCallInProgress = false;

                        const whoisResources = errorWhoisResources.data;
                        this.AlertService.setAllErrors(whoisResources);
                        if (!_.isEmpty(whoisResources.getAttributes())) {
                            this.ErrorReporterService.log("TextModify", this.object.type, this.AlertService.getErrors(), whoisResources.getAttributes());
                        }
                    },
                );
            }, () => {
                this.$log.error("Error authenticating");
            },
        );

    }

    public switchToWebMode() {
        this.$log.debug("Switching to web-mode");

        this.PreferenceService.setWebMode();

        this.$state.transitionTo("webupdates.modify", {
            name: this.object.name,
            objectType: this.object.type,
            source: this.object.source,
        });
    }

    public cancel() {
        if (this.$window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.navigateToDisplayPage(this.object.source, this.object.type, this.object.name, undefined);
        }
    }

    public deleteObject() {
        this.TextCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, "textupdates.modify");
    }

    private fetchAndPopulateObject() {

        // see if we have a password from a previous session
        if (this.CredentialsService.hasCredentials()) {
            this.$log.debug("Found password in CredentialsService for fetch");
            this.passwords.push(this.CredentialsService.getCredentials().successfulPassword);
        }
        this.restCallInProgress = true;
        this.$q.all({
            mntners: this.RestService.fetchMntnersForSSOAccount(),
            objectToModify: this.RestService.fetchObject(this.object.source, this.object.type, this.object.name, this.passwords, true),
        }).then((results) => {
                this.restCallInProgress = false;
                const attributes = this.handleFetchResponse(results.objectToModify);
                // store mntners for SSO account
                this.mntners.sso = results.mntners;
                this.TextCommonsService.authenticate("Modify", this.object.source, this.object.type, this.object.name,
                    this.mntners.sso, attributes, this.passwords, this.override)
                    .then(() => {
                        this.$log.debug("Successfully authenticated");
                        this.refreshObjectIfNeeded(this.object.source, this.object.type, this.object.name);
                    }, () => {
                        this.$log.error("Error authenticating");
                    },
                );
            },
        ).catch((error) => {
                this.restCallInProgress = false;
                if (error.data) {
                    this.AlertService.setErrors(error.data);
                } else {
                    this.AlertService.setGlobalError("Error fetching maintainers associated with this SSO account");
                }
            },
        );
    }

    private handleFetchResponse(objectToModify: any) {
        this.$log.debug("[textModifyController] object to modify: " + JSON.stringify(objectToModify));
        // Extract attributes from response
        const attributes = objectToModify.getAttributes();

        // Needed by display screen
        this.MessageStore.add("DIFF", _.cloneDeep(attributes));

        // prevent created and last-modfied to be in
        attributes.removeAttributeWithName("created");
        attributes.removeAttributeWithName("last-modified");

        const obj = {
            attributes,
            override: this.override,
            passwords: this.passwords,
        };
        this.object.rpsl = this.RpslService.toRpsl(obj);
        this.$log.debug("RPSL:" + this.object.rpsl);

        return attributes;
    }

    private navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: any) {
        this.$state.transitionTo("webupdates.display", {
            method: operation,
            name: objectName,
            objectType,
            source,
        });
    }

    private refreshObjectIfNeeded(objectSource: string, objectType: string, objectName: string) {
        this.$log.debug("refreshObjectIfNeeded:" + objectType);
        if (objectType === "mntner") {
            let password = null;
            if (this.CredentialsService.hasCredentials()) {
                password = this.CredentialsService.getCredentials().successfulPassword;
            }

            this.restCallInProgress = true;
            this.RestService.fetchObject(objectSource, objectType, objectName, password, true)
                .then((result: any) => {
                    this.restCallInProgress = false;
                    this.handleFetchResponse(result);
                }, () => {
                    this.restCallInProgress = false;
                    // ignore
                },
            );
        }
    }
}

angular.module("textUpdates")
    .component("textModify", {
        controller: TextModifyController,
        templateUrl: "./modify.html",
    });
