interface IOptionList {
    status: IStatusOption[];
}

interface IMaintainers {
    alternatives?: IMntByModel[];
    object: IMntByModel[];
    objectOriginal: IMntByModel[];
    sso: IMntByModel[];
}

class CreateModifyController {
    public static $inject = ["$scope", "$stateParams", "$state", "$anchorScroll", "$location", "$log", "$window", "$q", "$sce",
        "$document", "WhoisResources", "WhoisMetaService", "MessageStore", "CredentialsService", "RestService", "ModalService",
        "MntnerService", "AlertService", "ErrorReporterService", "LinkService", "ResourceStatus",
        "WebUpdatesCommonsService", "OrganisationHelperService", "PreferenceService", "EnumService", "CharsetToolsService",
        "ScreenLogicInterceptorService", "ObjectUtilService"];

    public optionList: IOptionList = {status: []};
    // public optionList: any;
    public name: string;
    public source: string;
    public objectType: string;
    // public maintainers: any;
    public maintainers: IMaintainers = {
        alternatives: [],
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public mntbyDescription: string;
    public mntbySyntax: string;
    public operation: string;
    public restCallInProgress: boolean;
    public uiSelectTemplateReady: boolean = false;
    /*
     * Lazy rendering of attributes with scrollmarker directive
     */
    public nrAttributesToRender: number = 50; // initial
    public attributesAllRendered: boolean = false;
    public inetnumParentAuthError: boolean = false;
    public attributes: any;
    public roleForAbuseC: any;
    public personRe: RegExp = new RegExp(/^[A-Z][A-Z0-9\\.`"_-]{0,63}(?: [A-Z0-9\\.`"_-]{1,64}){0,9}$/i);

    public CREATE_OPERATION = "Create";
    public MODIFY_OPERATION = "Modify";
    public PENDING_OPERATION = "Pending";

    constructor(private $scope: angular.IScope,
                private $stateParams: ng.ui.IStateParamsService,
                private $state: ng.ui.IStateService,
                private $anchorScroll: ng.IAnchorScrollService,
                private $location: angular.ILocationService,
                private $log: angular.ILogService,
                private $window: any,
                private $q: ng.IQService,
                private $sce: any,
                private $document: angular.IDocumentService,
                private WhoisResources: WhoisResources,
                private WhoisMetaService: WhoisMetaService,
                private MessageStore: MessageStore,
                private CredentialsService: CredentialsService,
                private RestService: RestService,
                private ModalService: ModalService,
                private MntnerService: MntnerService,
                private AlertService: AlertService,
                private ErrorReporterService: ErrorReporterService,
                private LinkService: LinkService,
                private ResourceStatus: ResourceStatus,
                private WebUpdatesCommonsService: WebUpdatesCommonsService,
                private OrganisationHelperService: OrganisationHelperService,
                private PreferenceService: PreferenceService,
                private EnumService: EnumService,
                private CharsetToolsService: CharsetToolsService,
                private ScreenLogicInterceptorService: ScreenLogicInterceptorService,
                private ObjectUtilService: ObjectUtilService) {

        this.optionList = {status: []};

        this.inetnumParentAuthError = false;
        this.restCallInProgress = false;

        this.AlertService.clearErrors();

        // workaround for problem with order of loading ui-select fragments
        this.RestService.fetchUiSelectResources()
            .then(() => {
                this.uiSelectTemplateReady = true;
            });

        // extract parameters from the url
        this.source = this.$stateParams.source;
        this.objectType = this.$stateParams.objectType;

        if (!_.isUndefined(this.$stateParams.name)) {
            this.name = decodeURIComponent(this.$stateParams.name);
        }
        // set the statuses which apply to the objectType (if any)
        this.optionList.status = this.ResourceStatus.get(this.objectType);

        const redirect = !this.$stateParams.noRedirect;

        this.$log.debug("Url params: source:" + this.source +
            ". type:" + this.objectType +
            ", uid:" + this.name +
            ", redirect:" + redirect);

        // switch to text-screen if cookie says so and cookie is not to be ignored
        if (this.PreferenceService.isTextMode() && redirect) {
            this.switchToTextMode();
            return;
        }

        this.mntbyDescription = this.MntnerService.mntbyDescription(this.objectType);
        this.mntbySyntax = this.MntnerService.mntbySyntax(this.objectType);

        // Determine if this is a create or a modify
        if (!this.name) {
            this.operation = this.CREATE_OPERATION;

            // Populate empty attributes based on meta-info
            const mandatoryAttributesOnObjectType = this.WhoisMetaService.getMandatoryAttributesOnObjectType(this.objectType);
            if (_.isEmpty(mandatoryAttributesOnObjectType)) {
                this.$state.transitionTo("notFound");
                return;
            }

            this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, mandatoryAttributesOnObjectType);
            this.fetchDataForCreate();

        } else {
            this.operation = this.MODIFY_OPERATION;

            // Start empty, and populate with rest-result
            this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, []);

            this.fetchDataForModify();
        }
    }

    /*
     * Functions / callbacks below...
     */

    /**
     * Callback from ScrollerDirective. Return true when all attributes are on the screen -- it turns the scroller off.
     *
     * @returns {boolean}
     */
    public showMoreAttributes() {
        // Called from scrollmarker directive
        if (!this.attributesAllRendered && this.attributes && this.nrAttributesToRender < this.attributes.length) {
            this.nrAttributesToRender += 50; // increment
            this.$scope.$apply();
        } else {
            this.attributesAllRendered = true;
            return true;
        }
    }

    /*
     * Select status list for resources based on parent"s status.
     */
    public resourceParentFound(parent: any) {
        // get the list of available statuses for the parent
        let parentStatusValue;
        let parentStatusAttr;
        // if parent wasn"t found but we got an event anyway, use the default
        if (parent) {
            parentStatusAttr = _.find(parent.attributes.attribute, (attr) => {
                return "status" === attr.name;
            });
            if (parentStatusAttr && parentStatusAttr.value) {
                parentStatusValue = parentStatusAttr.value;
            }
        }

        this.optionList.status = this.ResourceStatus.get(this.objectType, parentStatusValue);

        // Allow the user to authorize against mnt-by or mnt-lower of this parent object
        // (https://www.pivotaltracker.com/story/show/118090295)

        // first check if the user needs some auth...
        if (parent.attributes) {
            const parentObject = this.WhoisResources.wrapAttributes(parent.attributes.attribute);
            this.restCallInProgress = true;
            this.MntnerService.getAuthForObjectIfNeeded(parentObject, this.maintainers.sso, this.operation, this.source, this.objectType, this.name)
                .then(() => {
                        this.restCallInProgress = false;
                        this.inetnumParentAuthError = false;
                    }, (error: any) => {
                        this.restCallInProgress = false;
                        this.$log.error("MntnerService.getAuthForObjectIfNeeded rejected authorisation: ", error);
                        if (!this.inetnumParentAuthError) {
                            this.AlertService.addGlobalError("Failed to authenticate parent resource");
                            this.inetnumParentAuthError = true;
                        }
                    },
                );
        }
    }

    /*
     * Methods called from the html-template
     */

    // Should show bell icon for abuse-c in case value is not specified and objectType is organisation
    public shouldShowBellIcon(attribute: any, objectType: string) {
        return attribute.name === "abuse-c" && !attribute.value && objectType === "organisation";
    }

    public createRoleForAbuseCAttribute() {
        const maintainers = _.map(this.maintainers.object, (o: any) => {
            return {name: "mnt-by", value: o.key};
        });
        const abuseAttr = this.attributes.getSingleAttributeOnName("abuse-c");
        abuseAttr.$$error = undefined;
        abuseAttr.$$success = undefined;
        this.ModalService.openCreateRoleForAbuseCAttribute(this.source, maintainers, this.CredentialsService.getPasswordsForRestCall(this.objectType))
            .then((roleAttrs: any) => {
                    this.roleForAbuseC = this.WhoisResources.wrapAndEnrichAttributes("role", roleAttrs);
                    this.attributes.setSingleAttributeOnName("abuse-c", this.roleForAbuseC.getSingleAttributeOnName("nic-hdl").value);
                    abuseAttr.$$success = "Role object for abuse-c successfully created";
                }, (error: any) => {
                    if (error !== "cancel") { // dismissing modal will hit this function with the string "cancel" in error arg
                        // TODO: pass more specific errors from REST? [RM]
                        abuseAttr.$$error = "The role object for the abuse-c attribute was not created";
                    }
                },
            );
    }

    public onMntnerAdded = (item: any) => {

        // enrich with new-flag
        this.maintainers.object = this.MntnerService.enrichWithNewStatus(this.maintainers.objectOriginal, this.maintainers.object);

        // adjust attributes
        this.copyAddedMntnerToAttributes(item.key);

        if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
            this.performAuthentication();
            return;
        }

        this.$log.debug("onMntnerAdded:" + JSON.stringify(item) + " object mntners now:" + JSON.stringify(this.maintainers.object));
        this.$log.debug("onMntnerAdded: attributes" + JSON.stringify(this.attributes));
    }

    public onMntnerRemoved(item: any) {

        if (this.maintainers.object.length === 0) {
            // make sure we do not remove the last mntner which act as anchor
            this.keepSingleMntnerInAttrsWithoutValue();
        } else {
            // remove it from the attributes right away
            this.removeMntnerFromAttrs(item);
        }

        this.$log.debug("onMntnerRemoved: " + JSON.stringify(item) + " object mntners now:" + JSON.stringify(this.maintainers.object));
        this.$log.debug("onMntnerRemoved: attributes" + JSON.stringify(this.attributes));
    }

    public isModifyWithSingleMntnerRemaining() {
        return this.operation === this.MODIFY_OPERATION && this.maintainers.object.length === 1;
    }

    public mntnerAutocomplete(query: any) {
        // need to typed characters
        this.RestService.autocomplete("mnt-by", query, true, ["auth"])
            .then((data: any[]) => {
                // mark new
                this.maintainers.alternatives = this.MntnerService.stripNccMntners(
                    this.MntnerService.enrichWithNewStatus(this.maintainers.objectOriginal,
                    this.filterAutocompleteMntners(this.enrichWithMine(data))), true);
            },
        );
    }

    // change to private
    public addNiceAutocompleteName(items: any[], attrName: string) {
        return _.map(items, (item) => {
            let name = "";
            let separator = " / ";
            if (item.type === "person") {
                name = item.person;
            } else if (item.type === "role") {
                name = item.role;
                if (attrName === "abuse-c" && typeof item["abuse-mailbox"] === "string") {
                    name = name.concat(separator + item["abuse-mailbox"]);
                }
            } else if (item.type === "aut-num") {
                // When we"re using an as-name then we"ll need 1st descr as well (pivotal#116279723)
                name = (angular.isArray(item.descr) && item.descr.length)
                    ? [item["as-name"], separator, item.descr[0]].join("")
                    : item["as-name"];
            } else if (angular.isString(item["org-name"])) {
                name = item["org-name"];
            } else if (angular.isArray(item.descr)) {
                name = item.descr.join("");
            } else if (angular.isArray(item.owner)) {
                name = item.owner.join("");
            } else {
                separator = "";
            }
            item.readableName = this.$sce.trustAsHtml(this.escape(item.key + separator + name));
            return item;
        });
    }

    // change to private
    public escape(input: string) {
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    public enumAutocomplete(attribute: any) {
        if (!attribute.$$meta.$$isEnum) {
            return [];
        }
        return this.EnumService.get(this.objectType, attribute.name);
    }

    public displayEnumValue(item: any) {
        if (item.key === item.value) {
            return item.key;
        }
        return item.value + " [" + item.key.toUpperCase() + "]";
    }

    // change to private
    public isServerLookupKey(refs: any) {
        return !(_.isUndefined(refs) || refs.length === 0);
    }

    public referenceAutocomplete(attribute: any, userInput: string): any {
        const attrName = attribute.name;
        const refs = attribute.$$meta.$$refs;
        const utf8Substituted = this.warnForNonSubstitutableUtf8(attribute, userInput);
        if (utf8Substituted && this.isServerLookupKey(refs)) {

            return this.RestService.autocompleteAdvanced(userInput, refs)
                .then((resp: any): any => {
                    return this.addNiceAutocompleteName(this.filterBasedOnAttr(resp, attrName), attrName);
                }, (): any => {
                    // autocomplete error
                    return [];
                });
        } else {
            // No suggestions since not a reference
            return [];
        }
    }
    // should be private
    public filterBasedOnAttr(suggestions: string, attrName: string) {
        return _.filter(suggestions, (item) => {
            if (attrName === "abuse-c") {
                return !_.isEmpty(item["abuse-mailbox"]);
            }
            return true;
        });
    }

    public isBrowserAutoComplete(attribute: any) {
        if (this.isServerLookupKey(attribute.$$meta.$$refs) || attribute.$$meta.$$isEnum) {
            return "off";
        } else {
            return "on";
        }
    }

    public fieldVisited(attribute: any) {
        if (attribute.name === "person") {
            attribute.$$error = (!attribute.value || this.personRe.exec(attribute.value)) ? "" : "Input contains unsupported characters.";
            attribute.$$invalid = !!attribute.$$error;
        }
        // Verify if primary-key not already in use
        if (this.operation === this.CREATE_OPERATION && attribute.$$meta.$$primaryKey === true) {
            this.RestService.autocomplete(attribute.name, attribute.value, true, [])
                .then((data: any) => {
                    if (_.any(data, (item: any) => {
                        return this.uniformed(item.type) === this.uniformed(attribute.name) &&
                            this.uniformed(item.key) === this.uniformed(attribute.value);
                    })) {
                        attribute.$$error = attribute.name + " " +
                            this.LinkService.getModifyLink(this.source, this.objectType, attribute.value) +
                            " already exists";
                    } else {
                        attribute.$$error = "";
                    }
                }, (error: any) => {
                    this.$log.error("Autocomplete error " + JSON.stringify(error));
                });
        }

        if (this.operation === this.CREATE_OPERATION && attribute.value) {
            if (this.objectType === "aut-num" && attribute.name === "aut-num" ||
                this.objectType === "inetnum" && attribute.name === "inetnum" ||
                this.objectType === "inet6num" && attribute.name === "inet6num") {
                this.RestService.fetchParentResource(this.objectType, attribute.value).get((result: any) => {
                    let parent;
                    if (result && result.objects && angular.isArray(result.objects.object)) {
                        parent = result.objects.object[0];
                    }
                    this.resourceParentFound(parent);
                }, () => {
                    this.resourceParentFound(null);
                });
            }
        }
    }

    // should be private
    public uniformed(input: string) {
        if (_.isUndefined(input)) {
            return input;
        }
        return _.trim(input).toUpperCase();
    }

    public hasMntners() {
        return this.maintainers.object.length > 0;
    }

    public canAttributeBeDuplicated(attr: any) {
        return this.attributes.canAttributeBeDuplicated(attr) && !attr.$$meta.$$isLir && !attr.$$meta.$$disable;
    }

    public duplicateAttribute(attr: any) {
        this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, this.attributes.duplicateAttribute(attr));
    }

    public canAttributeBeRemoved(attr: any) {
        return this.attributes.canAttributeBeRemoved(attr) && !attr.$$meta.$$isLir && !attr.$$meta.$$disable;
    }

    public removeAttribute(attr: any) {
        this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, this.attributes.removeAttribute(attr));
    }

    public displayAddAttributeDialog(attr: any) {
        let originalAddableAttributes = this.attributes.getAddableAttributes(this.objectType, this.attributes);
        originalAddableAttributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, originalAddableAttributes);

        const addableAttributes = _.filter(
            this.ScreenLogicInterceptorService.beforeAddAttribute(this.operation, this.source, this.objectType, this.attributes, originalAddableAttributes),
            (attrPred: any) => {
                return !attrPred.$$meta.$$isLir;
            });

        this.ModalService.openAddAttributeModal(addableAttributes)
            .then((selectedItem: any) => {
                this.addSelectedAttribute(selectedItem, attr);
            });
    }

    public addSelectedAttribute(selectedAttributeType: string, attr: IAttributeModel) {
        const attrs = this.attributes.addAttributeAfter(selectedAttributeType, attr);
        this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, attrs);
    }

    public displayMd5DialogDialog(attr: IAttributeModel) {
        this.ModalService.openMd5Modal()
            .then((authLine: any) => {
                attr.value = authLine;
            });
    }

    public isResourceWithNccMntner() {
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            return _.some(this.maintainers.objectOriginal, (mntner: any) => {
                return this.MntnerService.isNccMntner(mntner.key);
            });
        }
        return false;
    }

    public deleteObject() {
        this.WebUpdatesCommonsService.navigateToDelete(this.source, this.objectType, this.name, STATE.MODIFY);
    }

    public submit() {

        const onSubmitSuccess = (resp: any) => {
            this.restCallInProgress = false;

            const whoisResources = resp;

            // Post-process attribute after submit-success using screen-logic-interceptor
            if (this.interceptOnSubmitSuccess(this.operation, whoisResources.getAttributes()) === false) {

                // It" ok to just let it happen or fail.
                this.OrganisationHelperService.updateAbuseC(this.source, this.objectType, this.roleForAbuseC, this.attributes);

                // stick created object in temporary store, so display-screen can fetch it from here
                this.MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);

                // make transition to next display screen
                this.WebUpdatesCommonsService.navigateToDisplay(this.source, this.objectType, whoisResources.getPrimaryKey(), this.operation);
            }
        };

        const onSubmitError = (resp: any) => {

            const whoisResources = resp.data;
            const errorMessages: string[] = [];
            const warningMessages: string[] = [];
            const infoMessages: string[] = [];

            this.restCallInProgress = false;
            this.attributes = whoisResources.getAttributes();

            // This interceptor allows us to convert error into success
            // This could change in the future
            const intercepted = this.ScreenLogicInterceptorService.afterSubmitError(this.operation,
                this.source, this.objectType,
                resp.status, resp.data,
                errorMessages, warningMessages, infoMessages);

            // Post-process attribute after submit-error using screen-logic-interceptor
            if (intercepted) {
                this.loadAlerts(errorMessages, warningMessages, infoMessages);
                /* Instruct downstream screen (typically display screen) that object is in pending state */
                this.WebUpdatesCommonsService.navigateToDisplay(this.source, this.objectType, whoisResources.getPrimaryKey(), this.PENDING_OPERATION);
            } else {
                this.validateForm();
                const firstErr = this.AlertService.populateFieldSpecificErrors(this.objectType, this.attributes, whoisResources);
                this.AlertService.setErrors(whoisResources);
                this.ErrorReporterService.log(this.operation, this.objectType, this.AlertService.getErrors(), this.attributes);
                this.attributes = this.interceptBeforeEdit(this.operation, this.attributes);
                if (firstErr) {
                    setTimeout(() => {
                        this.$location.hash("anchor-" + firstErr);
                        this.$anchorScroll();
                    }, 0);
                }
            }
        };

        // Post-process attributes before submit using screen-logic-interceptor
        this.attributes = this.interceptAfterEdit(this.operation, this.attributes);

        if (!this.validateForm()) {
            this.ErrorReporterService.log(this.operation, this.objectType, this.AlertService.getErrors(), this.attributes);
        } else {
            this.stripNulls();
            this.AlertService.clearErrors();

            if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                this.performAuthentication();
                return;
            }

            const passwords = this.CredentialsService.getPasswordsForRestCall(this.objectType);

            this.restCallInProgress = true;

            this.splitAttrsCommentsFromValue();

            if (!this.name) {
                this.RestService.createObject(this.source, this.objectType,
                    this.WhoisResources.turnAttrsIntoWhoisObject(this.attributes), passwords)
                    .then(
                        onSubmitSuccess,
                        onSubmitError);

            } else {
                // TODO: Temporary function till RPSL clean up
                if (this.MntnerService.isLoneRpslMntner(this.maintainers.objectOriginal)) {
                    passwords.push("RPSL");
                }

                this.RestService.modifyObject(this.source, this.objectType, this.name,
                    this.WhoisResources.turnAttrsIntoWhoisObject(this.attributes), passwords).then(
                    onSubmitSuccess,
                    onSubmitError);
            }
        }
    }

    public switchToTextMode() {
        this.$log.debug("Switching to text-mode");

        this.PreferenceService.setTextMode();

        if (!this.name) {
            this.$state.transitionTo("textupdates.create", {
                objectType: this.objectType,
                source: this.source,
            });
        } else {
            this.$state.transitionTo("textupdates.modify", {
                name: this.name,
                objectType: this.objectType,
                source: this.source,
            });
        }
    }
// FIXME SHOULD BE private
    public splitAttrsCommentsFromValue() {
        for (const attribute of this.attributes) {
            if (attribute.value && attribute.value.indexOf("#") > -1) {
                attribute.comment = attribute.value.substring(attribute.value.indexOf("#") + 1, attribute.value.length);
                attribute.value = attribute.value.substring(0, attribute.value.indexOf("#"));
            }
        }
    }

    public cancel() {
        if (this.$window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.navigateAway();
        }
    }

    public getAttributeShortDescription(attrName: string) {
        return this.WhoisMetaService.getAttributeShortDescription(this.objectType, attrName);
    }

    public getAttributeDescription(attrName: string) {
        return this.WhoisMetaService.getAttributeDescription(this.objectType, attrName);
    }

    public getAttributeSyntax(attrName: string) {
        return this.WhoisMetaService.getAttributeSyntax(this.objectType, attrName);
    }

    public isLirObject() {
        return this.ObjectUtilService.isLirObject(this.attributes);
    }

    public isMine(mntner: IMntByModel) {
        return this.MntnerService.isMine(mntner);
    }

    public isRemovable(mntnerKey: string) {
        return this.MntnerService.isRemovable(mntnerKey);
    }

    public hasSSo(mntner: IMntByModel) {
        return this.MntnerService.hasSSo(mntner);
    }

    public hasPgp(mntner: IMntByModel) {
        return this.MntnerService.hasPgp(mntner);
    }

    public hasMd5(mntner: IMntByModel) {
        return this.MntnerService.hasMd5(mntner);
    }

    public isNew(mntner: any) {
        return this.MntnerService.isNew(mntner);
    }

    /*
     * private methods
     */

    private warnForNonSubstitutableUtf8(attribute: any, userInput: string) {
        if (!this.CharsetToolsService.isLatin1(userInput)) {
            // see if any chars can be substituted
            const subbedValue = this.CharsetToolsService.replaceSubstitutables(userInput);
            if (!this.CharsetToolsService.isLatin1(subbedValue)) {
                attribute.$$error = "Input contains illegal characters. These will be converted to '?'";
                return false;
            } else {
                attribute.$$error = "";
                return true;
            }
        }
        return true;
    }

    private fetchDataForCreate() {
        this.restCallInProgress = true;
        this.RestService.fetchMntnersForSSOAccount()
            .then((results: any) => {
                let attributes;
                this.restCallInProgress = false;
                this.maintainers.sso = results;
                if (this.maintainers.sso.length > 0) {

                    this.maintainers.objectOriginal = [];
                    // populate ui-select box with sso-mntners
                    this.maintainers.object = _.cloneDeep(this.maintainers.sso);

                    // copy mntners to attributes (for later submit)
                    const mntnerAttrs = _.map(this.maintainers.sso, (i: any) => {
                        return {name: "mnt-by", value: i.key};
                    });

                    attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType,
                        this.attributes.addAttrsSorted("mnt-by", mntnerAttrs));

                    // Post-process atttributes before showing using screen-logic-interceptor
                    this.attributes = this.interceptBeforeEdit(this.CREATE_OPERATION, attributes);

                    this.$log.debug("mntnrs-sso:" + JSON.stringify(this.maintainers.sso));
                    this.$log.debug("mntn rs-object-original:" + JSON.stringify(this.maintainers.objectOriginal));
                    this.$log.debug("mntners-object:" + JSON.stringify(this.maintainers.object));

                } else {
                    attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, this.attributes);
                    this.attributes = this.interceptBeforeEdit(this.CREATE_OPERATION, attributes);
                }
            }, (error) => {
                this.restCallInProgress = false;
                this.$log.error("Error fetching mntners for SSO:" + JSON.stringify(error));
                this.AlertService.setGlobalError("Error fetching maintainers associated with this SSO account");
            });
    }

    private loadAlerts(errorMessages: string[], warningMessages: string[], infoMessages: string[]) {
        errorMessages.forEach((error: string) => {
            this.AlertService.addGlobalError(error);
        });

        warningMessages.forEach((warning: string) => {
            this.AlertService.addGlobalWarning(warning);
        });

        infoMessages.forEach((info: string) => {
            this.AlertService.addGlobalInfo(info);
        });
    }

    private interceptBeforeEdit(method: string, attributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];
        const interceptedAttrs = this.ScreenLogicInterceptorService.beforeEdit(method,
            this.source, this.objectType, attributes,
            errorMessages, warningMessages, infoMessages);

        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private interceptAfterEdit(method: string, attributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];
        const interceptedAttrs = this.ScreenLogicInterceptorService.afterEdit(method,
            this.source, this.objectType, attributes,
            errorMessages, warningMessages, infoMessages);

        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private interceptOnSubmitSuccess(method: string, responseAttributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];

        const interceptedAttrs = this.ScreenLogicInterceptorService.afterSubmitSuccess(method,
            this.source, this.objectType, responseAttributes,
            warningMessages, infoMessages);
        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private fetchDataForModify() {

        let password = null;
        if (this.CredentialsService.hasCredentials()) {
            password = this.CredentialsService.getCredentials().successfulPassword;
        }
        // wait until both have completed
        this.restCallInProgress = true;
        this.$q.all({
            mntners: this.RestService.fetchMntnersForSSOAccount(),
            objectToModify: this.RestService.fetchObject(this.source, this.objectType, this.name, password)})
            .then((results: any) => {
                this.restCallInProgress = false;
                this.$log.debug("[createModifyController] object to modify: " + JSON.stringify(results.objectToModify));

                // store mntners for SSO account
                this.maintainers.sso = results.mntners;
                this.$log.debug("maintainers.sso:" + JSON.stringify(this.maintainers.sso));

                // store object to modify
                this.attributes = results.objectToModify.getAttributes();

                // Create empty attribute with warning for each missing mandatory attribute
                this.insertMissingMandatoryAttributes();

                // save object for later diff in display-screen
                this.MessageStore.add("DIFF", _.cloneDeep(this.attributes));

                // prevent warning upon modify with last-modified
                this.attributes.removeAttributeWithName("last-modified");

                // this is where we must authenticate against
                this.maintainers.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);

                // starting point for further editing
                this.maintainers.object = this.extractEnrichMntnersFromObject(this.attributes);

                // Post-process atttribute before showing using screen-logic-interceptor
                this.attributes = this.interceptBeforeEdit(this.MODIFY_OPERATION, this.attributes);

                // fetch details of all selected maintainers concurrently
                this.restCallInProgress = true;
                this.RestService.detailsForMntners(this.maintainers.object).then((result: any[]) => {
                    this.restCallInProgress = false;

                    // result returns an array for each mntner

                    this.maintainers.objectOriginal = _.flatten(result);
                    this.$log.debug("mntners-object-original:" + JSON.stringify(this.maintainers.objectOriginal));

                    // of course none of the initial ones are new
                    this.maintainers.object = this.MntnerService.enrichWithNewStatus(this.maintainers.objectOriginal, _.flatten(result));
                    this.$log.debug("mntners-object:" + JSON.stringify(this.maintainers.object));

                    if (this.MntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                        this.performAuthentication();
                    }
                }, (error) => {
                    this.restCallInProgress = false;
                    this.$log.error("Error fetching sso-mntners details" + JSON.stringify(error));
                    this.AlertService.setGlobalError("Error fetching maintainer details");
                });
                // now let"s see if there are any read-only restrictions on these attributes. There is if any of
                // these are true:
                //
                // * this is an inet(6)num and it has a "sponsoring-org" attribute which refers to an LIR
                // * this is an inet(6)num and it has a "org" attribute which refers to an LIR
                // * this is an organisation with an "org-type: LIR" attribute and attribute.name is address|fax|e-mail|phone
            }).catch((error: any) => {
                this.restCallInProgress = false;
                try {
                    const whoisResources = error.data;
                    this.attributes = this.wrapAndEnrichResources(this.objectType, error.data);
                    this.AlertService.setErrors(whoisResources);
                } catch (e) {
                    this.$log.error("Error fetching sso-mntners for SSO:" + JSON.stringify(error));
                    this.AlertService.setGlobalError("Error fetching maintainers associated with this SSO account");
                }
            },
        );
    }

    private insertMissingMandatoryAttributes() {
        const missingMandatories = this.attributes.getMissingMandatoryAttributes(this.objectType);
        if (missingMandatories.length > 0) {
            _.each(missingMandatories, (item) => {
                this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType,
                    this.attributes.addMissingMandatoryAttribute(this.objectType, item));
            });
            this.validateForm();
        }
    }

    private copyAddedMntnerToAttributes(mntnerName: string) {
        this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, this.attributes.addAttrsSorted("mnt-by", [
            {name: "mnt-by", value: mntnerName},
        ]));
    }

    private keepSingleMntnerInAttrsWithoutValue() {
        // make sure we do not remove the last mntner which act as anchor
        _.map(this.attributes, (attr: any) => {
            if (attr.name === "mnt-by") {
                attr.value = null;
                return attr;
            }
            return attr;
        });
    }

    private removeMntnerFromAttrs(item: any) {
        _.remove(this.attributes, (i: any) => {
            return i.name === "mnt-by" && i.value === item.key;
        });
    }

    private extractEnrichMntnersFromObject(attributes: any[]): any[] {
        // get mntners from response
        const mntnersInObject: any[] = _.filter(attributes, (i: any) => {
            return i.name === "mnt-by";
        });

        // determine if mntner is mine
        return _.map(mntnersInObject, (mntnerAttr: any) => {
            return {
                key: mntnerAttr.value,
                mine: _.contains(_.map(this.maintainers.sso, "key"), mntnerAttr.value),
                type: "mntner",
            };
        });
    }

    private filterAutocompleteMntners(mntners: any[]) {
        return _.filter(mntners, (mntner) => {
            // prevent that RIPE-NCC mntners can be added to an object upon create of modify
            // prevent same mntner to be added multiple times
            return !this.MntnerService.isNccMntner(mntner.key) && !this.MntnerService.isMntnerOnlist(this.maintainers.object, mntner);
        });
    }

    private validateForm() {
        return this.attributes.validate() && this.OrganisationHelperService.validateAbuseC(this.objectType, this.attributes);
    }

    private isFormValid() {
        return !this.inetnumParentAuthError && this.attributes.validateWithoutSettingErrors();
    }

    private hasErrors() {
        return this.AlertService.hasErrors();
    }

    private stripNulls() {
        this.attributes = this.WhoisResources.wrapAndEnrichAttributes(this.objectType, this.attributes.removeNullAttributes());
    }

    private wrapAndEnrichResources(objectType: string, resp: any) {
        const whoisResources = this.WhoisResources.wrapWhoisResources(resp);
        if (whoisResources) {
            this.attributes = this.WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
        }
        return whoisResources;
    }

    private enrichWithMine(mntners: any[]) {
        return _.map(mntners, (mntner: any) => {
            // search in selected list
            mntner.mine = !!this.MntnerService.isMntnerOnlist(this.maintainers.sso, mntner);
            return mntner;
        });
    }

    private refreshObjectIfNeeded(associationResp: any) {
        if (this.operation === "Modify" && this.objectType === "mntner") {
            if (associationResp) {
                this.wrapAndEnrichResources(this.objectType, associationResp);
            } else {
                let password = null;
                if (this.CredentialsService.hasCredentials()) {
                    password = this.CredentialsService.getCredentials().successfulPassword;
                }
                this.restCallInProgress = true;
                this.RestService.fetchObject(this.source, this.objectType, this.name, password)
                    .then((result: any) => {
                        this.restCallInProgress = false;

                        this.attributes = result.getAttributes();

                        // save object for later diff in display-screen
                        this.MessageStore.add("DIFF", _.cloneDeep(this.attributes));

                        this.$log.debug("sso-ntners:" + JSON.stringify(this.maintainers.sso));
                        this.$log.debug("objectMaintainers:" + JSON.stringify(this.maintainers.object));

                    }, () => {
                        this.restCallInProgress = false;
                        // ignore
                    },
                );
            }
            this.maintainers.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);
            this.maintainers.object = this.extractEnrichMntnersFromObject(this.attributes);
        }
    }

    private navigateAway() {
        if (this.operation === "Modify") {
            this.WebUpdatesCommonsService.navigateToDisplay(this.source, this.objectType, this.name, undefined);
        } else {
            this.$state.transitionTo("webupdates.select");
        }
    }

    private performAuthentication() {
        const authParams = {
            failureClbk: this.navigateAway,
            isLirObject: this.ObjectUtilService.isLirObject(this.attributes),
            maintainers: this.maintainers,
            object: {
                name: this.name,
                source: this.source,
                type: this.objectType,
            },
            operation: this.operation,
            successClbk: this.onSuccessfulAuthentication,
        };
        this.WebUpdatesCommonsService.performAuthentication(authParams);
    }

    private onSuccessfulAuthentication = (associationResp: any) => {
        this.refreshObjectIfNeeded(associationResp);
    }
}

angular.module("webUpdates")
    .component("createModify", {
        controller: CreateModifyController,
        templateUrl: "scripts/updates/web/createModify.html",
    });
