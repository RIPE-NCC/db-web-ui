class DeleteController {

    public static $inject = ["$stateParams", "$state", "$log", "WhoisResources", "ModalService", "AlertService"];

    public modalInProgress: boolean;
    public source: string;
    public objectType: string;
    public name: string;
    public onCancel: string;
    public deletedObjects: any;

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public $log: angular.ILogService,
                public WhoisResources: any,
                public ModalService: ModalService,
                public AlertService: AlertService) {
        // this page does not raise a modal for authentication. It can be user directly either
        // if you are logged in and the object has your maintainers or if you have provided password
        // in the modify screen
        // TODO [TP]: modularise the authentication logic from createController and use it both in create/modify and in delete

        this.modalInProgress = true;

        this.AlertService.clearErrors();

        // extract parameters from the url
        this.source = this.$stateParams.source;
        this.objectType = this.$stateParams.objectType;
        this.name = decodeURIComponent(this.$stateParams.name);
        this.onCancel = this.$stateParams.onCancel;

        this.$log.debug("Url params: source:" + this.source + ". type:" + this.objectType + ", uid:" + this.name);

        this.deletedObjects = [];

        this.deleteObject();
    }

    public deleteObject() {
        this.$log.debug("_deleteObject called");
        this.ModalService.openDeleteObjectModal(this.source, this.objectType, this.name, this.onCancel)
            .then((whoisResources: any) => {
                this.modalInProgress = false;
                this.deletedObjects = whoisResources.objects.object;
                this.$log.debug("SUCCESS delete object" + JSON.stringify(whoisResources));
                // this.deletedObjects = whoisResources.objects.object;
                this.AlertService.setGlobalInfo("The following object(s) have been successfully deleted");
            }, (errorResp: any) => {
                this.modalInProgress = false;
                this.$log.debug("ERROR deleting object" + JSON.stringify(errorResp));
                if (errorResp.data) {
                    this.AlertService.setErrors(errorResp.data);
                }
            },
        );
    }
}

angular.module("webUpdates")
    .component("deleteComponent", {
        controller: DeleteController,
        templateUrl: "scripts/updates/web/delete.html",
    });
