class DisplayComponent {

    public static $inject = ["$stateParams", "$state", "$resource", "$log", "WhoisResources", "MessageStore",
        "RestService", "AlertService", "UserInfoService", "WebUpdatesCommonsService"];

    public objectSource: string;
    public objectType: string;
    public objectName: string;
    public method: string;
    public before: string;
    public after: string;
    public loggedIn: boolean;
    public attributes: any;
    // public attributes: IAttributeModel[];

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public $resource: any,
                public $log: angular.ILogService,
                public WhoisResources: any,
                public MessageStore: MessageStore,
                public RestService: RestService,
                public AlertService: AlertService,
                public UserInfoService: UserInfoService,
                public WebUpdatesCommonsService: WebUpdatesCommonsService) {

        this.AlertService.clearErrors();

        /*
         * Start of initialisation phase
         */

        // extract parameters from the url
        this.objectSource = this.$stateParams.source;
        this.objectType = this.$stateParams.objectType;
        // url-decode otherwise newly-created resource is MessageStore wiill not be found
        this.objectName = decodeURIComponent(this.$stateParams.name);
        this.method = this.$stateParams.method; // optional: added by create- and modify-controller

        this.$log.debug("DisplayComponent: Url params: source:" + this.objectSource + ". objectType:" + this.objectType +
            ", objectName:" + this.objectName + ", method:" + this.method);

        this.UserInfoService.getUserOrgsAndRoles()
            .then(() => {
                this.loggedIn = true;
            },
        );

        // fetch just created object from temporary store
        const cached = this.MessageStore.get(this.objectName);
        if (!_.isUndefined(cached)) {
            const whoisResources = this.WhoisResources.wrapWhoisResources(cached);
            this.attributes = this.WhoisResources.wrapAttributes(whoisResources.getAttributes());
            this.AlertService.populateFieldSpecificErrors(this.objectType, this.attributes, cached);
            this.AlertService.setErrors(whoisResources);

            if (this.method === "Modify") {
                const diff = this.WhoisResources.wrapAttributes(this.MessageStore.get("DIFF"));
                if (!_.isUndefined(diff)) {
                    this.before = diff.toPlaintext();
                    this.after = this.attributes.toPlaintext();
                }
            }
            this.WebUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
        } else {
            this.RestService.fetchObject(this.objectSource, this.objectType, this.objectName, null, null)
                .then((resp: any) => {
                    this.attributes = resp.getAttributes();
                    this.WebUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
                    this.AlertService.populateFieldSpecificErrors(this.objectType, this.attributes, resp);
                    this.AlertService.setErrors(resp);

                }, (resp) => {
                    this.AlertService.populateFieldSpecificErrors(this.objectType, this.attributes, resp.data);
                    this.AlertService.setErrors(resp.data);
                },
            );
        }
    }

    /*
     * Methods called from the html-template
     */
    private modifyButtonToBeShown() {
        return !this.AlertService.hasErrors() && !this.isPending();
    }

    private isPending() {
        return !_.isUndefined(this.method) && this.method === "Pending";
    }

    private isCreateOrModify() {
        return !(_.isUndefined(this.method) || this.isPending());
    }

    private getOperationName() {
        let name = "";
        if (this.method === "Create") {
            name = "created";
        } else if (this.method === "Modify") {
            name = "modified";
        }
        return name;
    }

    private navigateToSelect() {
        return this.$state.transitionTo("webupdates.select");
    }

    private navigateToModify() {
        return this.$state.transitionTo("webupdates.modify", {
            name: this.objectName,
            objectType: this.objectType,
            source: this.objectSource,
        });
    }

    private isDiff() {
        return !_.isUndefined(this.before) && !_.isUndefined(this.after);
    }

}

angular.module("webUpdates")
    .component("displayComponent", {
        controller: DisplayComponent,
        templateUrl: "scripts/updates/web/display.html",
    });
