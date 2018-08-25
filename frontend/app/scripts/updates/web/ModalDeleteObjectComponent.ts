interface IModalDelete {
    name: string;
    objectType: string;
    onCancel: string;
    source: string;
}

class ModalDeleteObjectController {

    public static $inject = [
        "$state", "$log", "RestService", "CredentialsService", "WhoisResources",
        "MessageStore"];

    public MAX_REFS_TO_SHOW: number = 5;

    public close: any;
    public dismiss: any;
    public resolve: IModalDelete;

    public reason = "I don\'t need this object";
    public incomingReferences: any;
    public canBeDeleted: any;
    public restCallInProgress = false;
    private isDismissed: boolean = true;

    constructor(public $state: ng.ui.IStateService,
                public $log: angular.ILogService,
                public RestService: any,
                public CredentialsService: CredentialsService,
                public WhoisResources: any,
                public MessageStore: MessageStore) {
    }

    public $onInit() {
        this.getReferences(this.resolve.source, this.resolve.objectType, this.resolve.name);
    }

    public $onDestroy() {
        if (this.isDismissed) {
            this.cancel();
        }
    }

    public delete() {
        if (!this.canBeDeleted) {
            return;
        }

        const deleteWithRefs = this.hasNonSelfIncomingRefs(this.resolve.objectType, this.resolve.name, this.incomingReferences);

        let password;
        if (this.CredentialsService.hasCredentials()) {
            password = this.CredentialsService.getCredentials().successfulPassword;
        }

        this.RestService.deleteObject(this.resolve.source, this.resolve.objectType, this.resolve.name, this.reason, deleteWithRefs, password)
            .then((resp: any) => {
                this.isDismissed = false;
                this.close({$value: resp});
            }, (error: any) => {
                this.dismiss(error);
            },
        );
    }

    // this method maybe can be removed because onDestroy should handle
    public cancel() {
        this.close();
        this.transitionToState(this.resolve.source, this.resolve.objectType, this.resolve.name, this.resolve.onCancel);
        this.isDismissed = false;
    }

    public isEqualTo(selfType: string, selfName: string, ref: any) {
        return ref.objectType.toUpperCase() === selfType.toUpperCase() && ref.primaryKey.toUpperCase() === selfName.toUpperCase();
    }

    public displayUrl(ref: any) {
        return this.$state.href("webupdates.display", {
            name: ref.primaryKey,
            objectType: ref.objectType,
            source: this.resolve.source,
        });
    }

    public isDeletable(parent: any) {
        if (_.isUndefined(parent) || _.isUndefined(parent.objectType)) {
            return false;
        }
        // parent is the object we asked references for
        const objectDeletable = _.every(parent.incoming, (first: any) => {
            // direct incoming references
            if (this.isEqualTo(parent.objectType, parent.primaryKey, first)) {
                // self ref
                this.$log.debug(first.primaryKey + " is first level self-ref");
                return true;
            } else {
                return _.every(first.incoming, (second: any) => {
                    // secondary incoming references
                    if (this.isEqualTo(first.objectType, first.primaryKey, second)) {
                        // self ref
                        this.$log.debug(second.primaryKey + " is second level self-ref");
                        return true;
                    } else if (this.isEqualTo(parent.objectType, parent.primaryKey, second)) {
                        // cross reference with parent
                        this.$log.debug(second.primaryKey + " is second level cross-ref");
                        return true;
                    } else {
                        this.$log.debug(second.primaryKey + " is an external ref");
                        return false;
                    }
                });
            }
        });
        this.$log.debug("objectDeletable:" + objectDeletable);

        return objectDeletable;
    }

    public hasNonSelfIncomingRefs(objectType: string, objectName: string, incomingRefs: any) {
        return _.some(incomingRefs, (ref) => {
            return !this.isEqualTo(objectType, objectName, ref);
        });
    }

    public getReferences(source: string, objectType: string, name: string) {
        this.restCallInProgress = true;
        this.RestService.getReferences(source, objectType, name, this.MAX_REFS_TO_SHOW)
            .then((resp: any) => {
                    this.restCallInProgress = false;
                    this.canBeDeleted = this.isDeletable(resp);
                    this.incomingReferences = resp.incoming;
                }, (error: any) => {
                    this.restCallInProgress = false;
                    this.dismiss(error.data);
                },
            );
    }

    public transitionToState(source: string, objectType: string, pkey: string, onCancel: string) {
        this.$state.transitionTo(onCancel, {
            name: pkey,
            objectType,
            source,
        });
    }
}

angular.module("webUpdates")
    .component("modalDeleteObject", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalDeleteObjectController,
        templateUrl: "scripts/updates/web/modalDeleteObject.html",
    });
