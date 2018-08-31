class DisplayDomainObjectsController {
    public static $inject = ["$state", "$stateParams", "MessageStore", "WhoisResources", "AlertService"];
    public source: string;
    public prefix: string;
    public objects: any;

    constructor(private $state: ng.ui.IStateService,
                private $stateParams: ng.ui.IStateParamsService,
                private MessageStore: MessageStore,
                private WhoisResources: any,
                private AlertService: AlertService) {
        this.source = this.$stateParams.source;

        const result = this.MessageStore.get("result");
        this.prefix = result.prefix;

        const whoisResources = this.WhoisResources.wrapWhoisResources(result.whoisResources);
        this.objects = whoisResources.objects.object;

        this.AlertService.clearErrors();
        this.AlertService.addErrors(whoisResources);
    }

    public navigateToSelect() {
        this.$state.transitionTo("webupdates.select");
    }
}
angular.module("dbWebApp")
    .component("displayDomainObjects", {
        controller: DisplayDomainObjectsController,
        templateUrl: "scripts/wizard/display-domain-objects.html",
    });
