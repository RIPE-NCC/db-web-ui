interface IAuthParams {
    maintainers: IMaintainers;
    object: {
        name: string;
        source: string
        type: string;
    };
    isLirObject?: boolean;
    successClbk?: (result: any) => void;
    failureClbk?: () => void;
    operation: string;
}

class WebUpdatesCommonsService {
    public static $inject = ["$state", "$log", "WhoisResources", "CredentialsService", "AlertService", "MntnerService", "ModalService", "Properties"];

    constructor(private $state: ng.ui.IStateService,
                private $log: angular.ILogService,
                private WhoisResources: WhoisResources,
                private CredentialsService: CredentialsService,
                private AlertService: AlertService,
                private MntnerService: MntnerService,
                private ModalService: ModalService,
                private Properties: IProperties) {

    }

    public performAuthentication(authParams: IAuthParams) {
        this.$log.debug("Perform authentication", authParams.maintainers);
        const mntnersWithPasswords = this.MntnerService.getMntnersForPasswordAuthentication(authParams.maintainers.sso,
                                                                                            authParams.maintainers.objectOriginal,
                                                                                            authParams.maintainers.object);
        const mntnersWithoutPasswords =
            this.MntnerService.getMntnersNotEligibleForPasswordAuthentication(authParams.maintainers.sso,
                                                                              authParams.maintainers.objectOriginal,
                                                                              authParams.maintainers.object);
        // see: https://www.pivotaltracker.com/n/projects/769061
        const allowForcedDelete = !_.find(authParams.maintainers.object, (o: any) => {
            return this.MntnerService.isNccMntner(o.key);
        });
        this.ModalService.openAuthenticationModal(null, authParams.object, mntnersWithPasswords,
            mntnersWithoutPasswords, allowForcedDelete, authParams.isLirObject).then(
            (result: any) => {
                this.AlertService.clearErrors();
                const selectedMntner = result.selectedItem;
                this.$log.debug("selected mntner:" + angular.toJson(selectedMntner));
                const associationResp = result.response;
                this.$log.debug("associationResp:" + angular.toJson(associationResp));
                if (this.MntnerService.isMine(selectedMntner)) {
                    // has been successfully associated in authentication modal
                    authParams.maintainers.sso.push(selectedMntner);
                    // mark starred in selected
                    authParams.maintainers.object = this.MntnerService.enrichWithMine(authParams.maintainers.sso, authParams.maintainers.object);
                }
                this.$log.debug("After auth: maintainers.sso:", authParams.maintainers.sso);
                this.$log.debug("After auth: maintainers.object:", authParams.maintainers.object);
                if (angular.isFunction(authParams.successClbk)) {
                    authParams.successClbk(associationResp);
                }
            }, () => {
                if (angular.isFunction(authParams.failureClbk)) {
                    authParams.failureClbk();
                }
            },
        );
    }

    public addLinkToReferenceAttributes(attributes: IAttributeModel[], objectSource: string) {
        const parser = document.createElement("a");
        return _.map(attributes, (attribute: any) => {
            if (!_.isUndefined(attribute.link)) {
                attribute.link.uiHref = this._displayUrl(parser, attribute, objectSource);
            }
            return attribute;
        });
    }

    public navigateToDisplay(objectSource: string, objectType: string, objectName: string, operation: string) {
        this.$state.transitionTo(STATE.DISPLAY, {
            method: operation,
            name: objectName,
            objectType,
            source: objectSource,
        });
    }

    public navigateToEdit(objectSource: string, objectType: string, objectName: string, operation: string) {
        this.$state.transitionTo(STATE.MODIFY, {
            method: operation,
            name: objectName,
            objectType,
            source: objectSource,
        });
    }

    public navigateToDelete(objectSource: string, objectType: string, objectName: string, onCancel: string) {
        this.$state.transitionTo(STATE.DELETE, {
            name: objectName,
            objectType,
            onCancel,
            source: objectSource,
        });
    }

    private _displayUrl(parser: any, attribute: IAttributeModel, objectSource: string) {
        parser.href = attribute.link.href;
        const parts = parser.pathname.split("/");

        return this.$state.href(STATE.DISPLAY, {
            name: _.last(parts),
            objectType: attribute["referenced-type"],
            source: this.Properties.SOURCE,
        });
    }
}

angular.module("webUpdates").service("WebUpdatesCommonsService", WebUpdatesCommonsService);
