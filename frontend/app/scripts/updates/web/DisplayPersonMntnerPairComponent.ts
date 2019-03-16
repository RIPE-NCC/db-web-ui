class DisplayPersonMntnerPairController {
    public static $inject = ["$stateParams", "$state", "$log", "WhoisResources", "MessageStore",
        "RestService", "AlertService"];

    public objectSource: string;
    public personName: string;
    public mntnerName: string;
    public personAttributes: IAttributeModel[];
    public mntnerAttributes: IAttributeModel[];

    constructor(
        public $stateParams: ng.ui.IStateParamsService,
        public $state: ng.ui.IStateService,
        public $log: angular.ILogService,
        public WhoisResources: WhoisResources,
        public MessageStore: MessageStore,
        public RestService: RestService,
        public AlertService: AlertService) {

        this.AlertService.clearErrors();

        // extract parameters from the url
        this.objectSource = $stateParams.source;
        this.personName = $stateParams.person;
        this.mntnerName = $stateParams.mntner;

        // fetch just created object from temporary store
        const cachedPersonObject = MessageStore.get(this.personName);
        if (cachedPersonObject) {
            const whoisResources = this.WhoisResources.wrapWhoisResources(cachedPersonObject);
            this.personAttributes = this.WhoisResources.wrapAttributes(whoisResources.getAttributes());
            $log.debug("Got person from cache:" + JSON.stringify(this.personAttributes));
        } else {
            this.RestService.fetchObject(this.objectSource, "person", this.personName, null, null)
                .then((resp: any) => {
                    this.personAttributes = resp.getAttributes();
                    this.AlertService.populateFieldSpecificErrors("person", this.personAttributes, resp);
                    this.AlertService.addErrors(resp);
                }, (error) => {
                    this.AlertService.populateFieldSpecificErrors("person", this.personAttributes, error.data);
                    this.AlertService.addErrors(error.data);
                });
        }

        const cachedMntnerObject = this.MessageStore.get(this.mntnerName);
        if (cachedMntnerObject) {
            const whoisResources = this.WhoisResources.wrapWhoisResources(cachedMntnerObject);
            this.mntnerAttributes = this.WhoisResources.wrapAttributes(whoisResources.getAttributes());
            $log.debug("Got mntner from cache:" + JSON.stringify(this.mntnerAttributes));
        } else {
            this.RestService.fetchObject(this.objectSource, "mntner", this.mntnerName, null, null)
                .then((resp: any) => {
                    this.mntnerAttributes = resp.getAttributes();
                    this.AlertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, resp);
                    this.AlertService.addErrors(resp);
                }, (error) => {
                    this.AlertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, error.data);
                    this.AlertService.addErrors(error.data);
                });
        }
    }
    public navigateToSelect() {
        return this.$state.transitionTo("webupdates.select");
    }

    public navigateToModifyPerson() {
        return this.$state.transitionTo("webupdates.modify", {
            name: this.personName,
            objectType: "person",
            source: this.objectSource,
        });
    }

    public navigateToModifyMntner() {
        return this.$state.transitionTo("webupdates.modify", {
            name: this.mntnerName,
            objectType: "mntner",
            source: this.objectSource,
        });
    }

    public navigateToSharedMntner() {
        return this.$state.transitionTo("webupdates.createSelfMnt", {
            admin: this.personName,
            objectType: "mntner",
            source: this.objectSource,
        });
    }

}

angular.module("webUpdates")
    .component("displayPersonMntnerPairComponent", {
        controller: DisplayPersonMntnerPairController,
        templateUrl: "./displayPersonMntnerPair.html",
    });
