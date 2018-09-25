interface IDomainObject {
    attributes: {
        attribute: any;
    };
    source: {
        id: string;
    };
}

class DomainObjectWizardController {
    public static $inject = ["$scope", "$rootScope", "$http", "$stateParams", "$location", "$anchorScroll", "$state",
        "JsUtilService", "AlertService", "ModalService", "RestService", "AttributeMetadataService", "WhoisResources",
        "MntnerService", "WebUpdatesCommonsService", "CredentialsService", "MessageStore", "PrefixService"];

    public objectType: string;
    public domainObject: IDomainObject;
    public attributes: any;
    public source: string;
    public errors: any[];
    public name: string;
    public operation: any;

    /*
     * Initial scope vars
     */
    public maintainers: IMaintainers = {
        alternatives: [],
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public restCallInProgress: boolean = false;
    public isValidatingDomains: boolean = false;

    constructor(private $scope: angular.IScope,
                private $rootScope: angular.IRootScopeService,
                private $http: ng.IHttpService,
                private $stateParams: ng.ui.IStateParamsService,
                private $location: angular.ILocationService,
                private $anchorScroll: ng.IAnchorScrollService,
                private $state: ng.ui.IStateService,
                private jsUtils: JsUtilService,
                private AlertService: AlertService,
                private ModalService: ModalService,
                private RestService: RestService,
                private AttributeMetadataService: any,
                private WhoisResources: any,
                private MntnerService: MntnerService,
                private WebUpdatesCommonsService: WebUpdatesCommonsService,
                private CredentialsService: CredentialsService,
                private MessageStore: MessageStore,
                private PrefixService: PrefixService,
                private ErrorReporterService: ErrorReporterService) {
        // show splash screen
        this.ModalService.openDomainWizardSplash();
        this.objectType = $stateParams.objectType === "domain" ? "prefix" : $stateParams.objectType;

        this.domainObject = {
            attributes: {
                attribute: AttributeMetadataService.determineAttributesForNewObject(this.objectType),
            },
            source: {
                id: $stateParams.source,
            },
        };

        this.attributes = this.domainObject.attributes.attribute;
        this.source = $stateParams.source;
        /*
         * Main
         */
        this.restCallInProgress = true;

        // should be the only thing to do, one day...
        this.AttributeMetadataService.enrich(this.attributes[0].name, this.attributes);

        $scope.$on("attribute-state-changed",  () => {
            AttributeMetadataService.enrich(this.objectType, this.attributes);
        });

        $scope.$on("prefix-ok", _.debounce(this.onValidPrefix, 600));

    }

    /*
     * Local functions
     */
    public onValidPrefix = (event: any, prefixValue: any) => {
        const revZonesAttr = _.find(this.attributes, (attr: any) => {
            return attr.name === "reverse-zone";
        });
        revZonesAttr.value = this.PrefixService.getReverseDnsZones(prefixValue);

        this.MntnerService.getMntsToAuthenticateUsingParent(prefixValue,  (mntners: any) => {

            const mySsos = _.map(this.maintainers.sso, "key");

            // NB don"t use the stupid enrichWithSso call cz it"s lame
            const enriched = _.map(mntners, (mntnerAttr: any) => {
                return {
                    key: mntnerAttr.value,
                    mine: _.contains(mySsos, mntnerAttr.value),
                    type: "mntner",
                };
            });
            this.RestService.detailsForMntners(enriched).then((enrichedMntners: any) => {
                this.maintainers.objectOriginal = enrichedMntners;
                this.RestService.fetchMntnersForSSOAccount().then((results: any) => {
                    this.maintainers.sso = results;
                    if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                        this.performAuthentication(this.maintainers);
                    }
                }, () => {
                    this.errors = [{plainText: "Error fetching maintainers associated with this SSO account"}];
                });

            });
        });
    }

    public readableError(errorMessage: any) {
        let idx = 0;
        return errorMessage.text.replace(/%s/g, (match: any) => {
            if (errorMessage.args.length - 1 >= idx) {
                const arg = errorMessage.args[idx].value;
                idx++;
                return arg;
            } else {
                return match;
            }
        });
    }

    public updateMaintainers(maintainers: IMaintainers) {
        this.maintainers = maintainers;
    }

    public containsInvalidValues(attributes?: any) {
        if (_.isUndefined(attributes)) {
            attributes = this.attributes;
        }
        const idx = _.findIndex(attributes, (attr: any) => {
            return attr.$$invalid;
        });
        return idx !== -1;
    }

    private submitButtonClicked() {

        if (this.containsInvalidValues(this.attributes)) {
            return;
        }

        if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
            this.performAuthentication(this.maintainers);
            return;
        }

        const flattenedAttributes = this.flattenStructure(this.attributes);
        const passwords = this.CredentialsService.getPasswordsForRestCall(this.objectType);

        this.restCallInProgress = true;
        this.isValidatingDomains = true;

        // close the alert message
        this.errors = [];

        const url = "api/whois/domain-objects/" + this.source;
        const data = {
            attributes: flattenedAttributes,
            passwords,
            type: this.objectType,
        };

        this.$http.post(url, data).then(() => {
            this.ModalService.openDomainCreationModal(data.attributes, this.domainObject.source.id)
                .then((response: any) => {
                    if (response.status === 200) {
                        return this.showCreatedDomains(response);
                    }
                    // ok then just wait and keep on pinging...
                }, (failResponse: any) => {
                    return this.createDomainsFailed(failResponse);
                });
        });

    }

    private flattenStructure(attributes: any) {
        const flattenedAttributes: any[] = [];
        _.forEach(attributes, (attr: any) => {
            if (this.jsUtils.typeOf(attr.value) === "array") {
                _.forEach(attr.value, (atr: any) => {
                    flattenedAttributes.push({name: atr.name, value: atr.value || ""});
                });
            } else {
                flattenedAttributes.push({name: attr.name, value: attr.value || ""});
            }
        });
        return flattenedAttributes;
    }

    private performAuthentication(maintainers: IMaintainers) {
        const authParams: IAuthParams = {
            isLirObject: false,
            maintainers,
            object: {
                name: this.name,
                source: this.source,
                type: this.objectType,
            },
            operation: this.operation,
        };
        this.WebUpdatesCommonsService.performAuthentication(authParams);
    }

    private showCreatedDomains(resp: any) {
        this.restCallInProgress = false;
        this.errors = [];
        this.isValidatingDomains = false;
        const prefix = _.find(this.attributes, (attr: any) => {
            return attr.name === "prefix";
        });
        this.AttributeMetadataService.resetDomainLookups(prefix.value);
        this.MessageStore.add("result", {prefix: prefix.value, whoisResources: resp.data});

        this.$state.transitionTo("webupdates.displayDomainObjects", {
            objectType: this.objectType,
            source: this.source,
        });
    }

    private createDomainsFailed(response: any) {
        this.restCallInProgress = false;
        this.isValidatingDomains = false;
        this.errors = _.filter(response.data.errormessages.errormessage, (errorMessage: any) => {
                errorMessage.plainText = this.readableError(errorMessage);
                return errorMessage.severity === "Error";
            });

        if (!_.isEmpty(this.errors)) {
            this.ErrorReporterService.log("DomainWizard", "domain", this.errors);
        }

        this.$location.hash("errors");
        this.$anchorScroll();
    }
}

angular.module("dbWebApp")
    .component("domainObjectWizard", {
        controller: DomainObjectWizardController,
        templateUrl: "scripts/wizard/domain-object-wizard.html",
    });
