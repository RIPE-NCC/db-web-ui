interface IObjectFromParameters {
    attributes: any;
    name: string;
    source: string;
    type: string;
}

class ForceDeleteController {
    public static $inject = ["$stateParams", "$state", "$log", "$q", "WhoisResources", "WebUpdatesCommonsService",
        "RestService", "MntnerService", "AlertService"];

    public object: IObjectFromParameters = {
        attributes: {},
        name: "",
        source: "",
        type: "",
    };
    public maintainers: IMaintainers = {
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public restCallInProgress: boolean = false;

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public $log: angular.ILogService,
                public $q: ng.IQService,
                public WhoisResources: any,
                public WebUpdatesCommonsService: WebUpdatesCommonsService,
                public RestService: RestService,
                public MntnerService: MntnerService,
                public AlertService: AlertService) {

        this.AlertService.clearErrors();

        // extract parameters from the url
        this.object.name = this.getNameFromUrl();
        this.object.source = this.$stateParams.source;
        this.object.type = this.$stateParams.objectType;

        this.$log.debug("ForceDeleteController: Url params: source:" + this.object.source + ". type:" + this.object.type + ", name: " + this.object.name);

        const hasError = this.validateParamsAndShowErrors();
        if (hasError === false) {
            this.fetchDataForForceDelete();
        }
    }

    public isFormValid(): boolean {
        return !this.AlertService.hasErrors();
    }

    private getNameFromUrl(): string {
        if (!_.isUndefined(this.$stateParams.name)) {
            return decodeURIComponent(this.$stateParams.name);
        }
    }

    private validateParamsAndShowErrors() {
        let hasError = false;
        const forceDeletableObjectTypes = ["inetnum", "inet6num", "route", "route6", "domain"];

        if (!_.contains(forceDeletableObjectTypes, this.object.type)) {

            const typesString = _.reduce(forceDeletableObjectTypes, (str, n) => {
                return str + ", " + n;
            });

            this.AlertService.setGlobalError("Only " + typesString + " object types are force-deletable");
            hasError = true;
        }

        if (_.isUndefined(this.object.source)) {
            this.AlertService.setGlobalError("Source is missing");
            hasError = true;
        }

        if (_.isUndefined(this.object.name)) {
            this.AlertService.setGlobalError("Object key is missing");
            hasError = true;
        }

        return hasError;
    }

    private fetchDataForForceDelete() {

        // wait until all three have completed
        this.restCallInProgress = true;
        this.$q.all({
            objectToModify: this.RestService.fetchObject(this.object.source, this.object.type, this.object.name),
            ssoMntners: this.RestService.fetchMntnersForSSOAccount()})
            .then((results: any) => {
                this.restCallInProgress = false;

                // store object to modify
                this.$log.debug("object to modify:" + JSON.stringify(results.objectToModify));
                this.wrapAndEnrichResources(this.object.type, results.objectToModify);

                // store mntners for SSO account
                this.maintainers.sso = results.ssoMntners;
                this.$log.debug("maintainers.sso:" + JSON.stringify(this.maintainers.sso));

                this.useDryRunDeleteToDetectAuthCandidates().then((authCandidates: any) => {
                        const objectMntners = _.map(authCandidates, (item) => {
                            return {
                                key: item,
                                type: "mntner",
                            };
                        });

                        // fetch details of all selected maintainers concurrently
                        this.restCallInProgress = true;
                        this.RestService.detailsForMntners(objectMntners)
                            .then((enrichedMntners: IMntByModel[]) => {
                                this.restCallInProgress = false;

                                this.maintainers.object = enrichedMntners;
                                this.$log.debug("maintainers.object:" + JSON.stringify(this.maintainers.object));

                            }, (error: any) => {
                                this.restCallInProgress = false;
                                this.$log.error("Error fetching mntner details" + JSON.stringify(error));
                                this.AlertService.setGlobalError("Error fetching maintainer details");
                            });

                    }, (errorMsg: any) => {
                        this.AlertService.setGlobalError(errorMsg);
                    });
            })
            .catch((error) => {
                this.restCallInProgress = false;
                if (error && error.data) {
                    this.$log.error("Error fetching object:" + JSON.stringify(error));
                    // FIXME scope.objecttype
                    const whoisResources = this.wrapAndEnrichResources(error.objectType, error.data);
                    this.AlertService.setErrors(whoisResources);
                } else {
                    this.$log.error("Error fetching mntner information:" + JSON.stringify(error));
                    this.AlertService.setGlobalError("Error fetching maintainers to force delete this object");
                }
            },
        );
    }

    private useDryRunDeleteToDetectAuthCandidates() {
        const deferredObject = this.$q.defer();

        this.restCallInProgress = true;
        this.RestService.deleteObject(this.object.source, this.object.type, this.object.name, "dry-run", false, undefined, true)
            .then(() => {
                this.restCallInProgress = false;
                this.$log.debug("auth can be performed without interactive popup");
                deferredObject.resolve([]);
            }, (error: any) => {
                this.restCallInProgress = false;
                // we expect an error: from the error we except auth candidates
                const whoisResources = this.WhoisResources.wrapWhoisResources(error.data);
                if (whoisResources.getRequiresAdminRightFromError()) {
                    deferredObject.reject("Deleting this object requires administrative authorisation");
                } else {
                    // strip RIPE-NCC- mntners
                    let authCandidates = whoisResources.getAuthenticationCandidatesFromError();
                    authCandidates = _.filter(authCandidates, (mntner: string) => {
                        return !(_.startsWith(mntner, "RIPE-NCC-"));
                    });
                    deferredObject.resolve(_.map(authCandidates, (item: string) => {
                        return _.trim(item);
                    }));
                }
            },
        );
        return deferredObject.promise;
    }

    private wrapAndEnrichResources(objectType: string, resp: any) {
        const whoisResources = this.WhoisResources.wrapWhoisResources(resp);
        if (whoisResources) {
            this.object.attributes = this.WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
        }
        return whoisResources;
    }

    private cancel() {
        this.WebUpdatesCommonsService.navigateToDisplay(this.object.source, this.object.type, this.object.name, undefined);
    }

    private forceDelete() {
        if (this.isFormValid()) {
            if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, [], this.maintainers.object)) {
                this.$log.debug("Need auth");
                this.performAuthentication();
            } else {
                this.$log.debug("No auth needed");
                this.onSuccessfulAuthentication();
            }
        }
    }

    private performAuthentication() {
        const authParams: IAuthParams = {
            failureClbk: this.cancel,
            // isLirObject: false,
            maintainers: this.maintainers,
            object: {
                name: this.object.name,
                source: this.object.source,
                type: this.object.type,
            },
            operation: "ForceDelete",
            successClbk: this.onSuccessfulAuthentication,
        };
        this.WebUpdatesCommonsService.performAuthentication(authParams);
    }

    private onSuccessfulAuthentication() {
        this.$log.debug("Navigate to force delete screen");
        this.WebUpdatesCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, STATE.FORCE_DELETE);
    }
}
angular.module("webUpdates")
    .component("forceDelete", {
        controller: ForceDeleteController,
        templateUrl: "scripts/updates/web/forceDelete.html",
    });
