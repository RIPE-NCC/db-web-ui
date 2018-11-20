class ModalDomainCreationWaitCotroller {

    public static $inject = ["PrefixService", "$q", "$interval"];

    public close: any;
    public dismiss: any;
    public resolve: any;
    public done: number;
    public todo: number;

    constructor(public PrefixService: PrefixService,
                public $q: ng.IQService,
                public $interval: ng.IIntervalService) {
        this.done = 100;
        // there"s probably a better way to get the number of domains we"ll create
        this.todo = _.filter(this.resolve.attributes, (attr: any) => {
            return attr.name === "reverse-zone";
        }).length;
        this.saving();
    }

    public saving() {
        const backendPinger = this.$interval(() => {
            this.PrefixService.getDomainCreationStatus(this.resolve.source)
                .then((response) => {
                    if (response.status === 200) {
                        this.$interval.cancel(backendPinger);
                        this.close({$value: response});
                    } else if (response.status === 204) {
                        // nothing happening in the backend
                        this.close({$value: response});
                        this.$interval.cancel(backendPinger);
                    }
                    // ok then just wait and keep on pinging...
                }, (failResponse) => {
                    this.$interval.cancel(backendPinger);
                    this.close({$value: failResponse});
                    // return createDomainsFailed(failResponse);
                });
        }, 2000);
    }

    public goAway() {
        this.dismiss();
    }

    public cancel() {
        this.dismiss();
    }
}

angular.module("dbWebApp")
    .component("modalDomainCreationWait", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalDomainCreationWaitCotroller,
        templateUrl: "scripts/wizard/modal-domain-creation-wait.html",
    });
