import {Component, Inject, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, distinctUntilChanged, map, mergeMap} from "rxjs/operators";
import {forkJoin, Observable, of} from "rxjs";
import * as _ from "lodash";
import {WINDOW} from "../core/window.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {MessageStoreService} from "./message-store.service";
import {CredentialsService} from "../shared/credentials.service";
import {RestService} from "./rest.service";
import {MntnerService} from "./mntner.service";
import {ErrorReporterService} from "./error-reporter.service";
import {LinkService} from "./link.service";
import {PreferenceService} from "./preference.service";
import {ResourceStatusService} from "../myresources/resource-status.service";
import {WebUpdatesCommonsService} from "./web-updates-commons.service";
import {OrganisationHelperService} from "./organisation-helper.service";
import {ScreenLogicInterceptorService} from "./screen-logic-interceptor.service";
import {EnumService} from "./enum.service";
import {CharsetToolsService} from "./charset-tools.service";
import {ObjectUtilService} from "./object-util.service";
import {IAttributeModel, IMntByModel, IStatusOption} from "../shared/whois-response-type.model";
import {STATE} from "./web-updates-state.constants";
import {ModalAddAttributeComponent} from "./modal-add-attribute.component";
import {ModalEditAttributeComponent} from "./modal-edit-attribute.component";
import {ModalMd5PasswordComponent} from "./modal-md5-password.component";
import {ModalCreateRoleForAbuseCComponent} from "./modal-create-role-for-abusec.component";
import {AttributeMetadataService} from "../attribute/attribute-metadata.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

interface IOptionList {
    status: IStatusOption[];
}

export interface IMaintainers {
    alternatives?: IMntByModel[];
    object: IMntByModel[];
    objectOriginal: IMntByModel[];
    sso: IMntByModel[];
}

@Component({
    selector: "create-modify",
    templateUrl: "./create-modify.component.html",
})
export class CreateModifyComponent {
    public optionList: IOptionList = {status: []};
    public name: string;
    public source: string;
    public objectType: string;
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
    /*
     * Lazy rendering of attributes with scrollmarker directive
     */
    public nrAttributesToRender: number = 50; // initial
    public attributesAllRendered: boolean = false;
    public inetnumParentAuthError: boolean = false;
    public attributes: any;
    public roleForAbuseC: any;
    public personRe: RegExp = new RegExp(/^[A-Z][A-Z0-9\\.`'_-]{0,63}(?: [A-Z0-9\\.`'_-]{1,64}){0,9}$/i);

    public CREATE_OPERATION = "Create";
    public MODIFY_OPERATION = "Modify";
    public PENDING_OPERATION = "Pending";

    public isMntHelpShown: boolean = false;
    public showAttrsHelp: [];

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(@Inject(WINDOW) private window: any,
                public whoisResourcesService: WhoisResourcesService,
                public attributeMetadataService: AttributeMetadataService,
                public whoisMetaService: WhoisMetaService,
                public messageStoreService: MessageStoreService,
                public credentialsService: CredentialsService,
                public restService: RestService,
                public modalService: NgbModal,
                public mntnerService: MntnerService,
                public errorReporterService: ErrorReporterService,
                public linkService: LinkService,
                public resourceStatusService: ResourceStatusService,
                public webUpdatesCommonsService: WebUpdatesCommonsService,
                public organisationHelperService: OrganisationHelperService,
                public preferenceService: PreferenceService,
                public enumService: EnumService,
                public charsetToolsService: CharsetToolsService,
                public screenLogicInterceptorService: ScreenLogicInterceptorService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
    }

    public ngOnInit() {
        this.optionList = {status: []};

        this.inetnumParentAuthError = false;
        this.restCallInProgress = false;

        this.alertsComponent.clearErrors();

        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryMap = this.activatedRoute.snapshot.queryParamMap;
        this.source = paramMap.get("source");
        this.objectType = paramMap.get("objectType");

        if (paramMap.has("objectName")) {
            this.name = decodeURIComponent(paramMap.get("objectName"));
        }
        // set the statuses which apply to the objectType (if any)
        this.optionList.status = this.resourceStatusService.get(this.objectType);

        const redirect = !queryMap.has("noRedirect");

        console.debug("Url params: source:" + this.source +
            ". type:" + this.objectType +
            ", uid:" + this.name +
            ", redirect:" + redirect);

        // switch to text-screen if cookie says so and cookie is not to be ignored
        if (this.preferenceService.isTextMode() && redirect) {
            this.switchToTextMode();
            return;
        }

        this.mntbyDescription = this.mntnerService.mntbyDescription(this.objectType);
        this.mntbySyntax = this.mntnerService.mntbySyntax(this.objectType);

        // Determine if this is a create or a modify
        if (this.name === undefined) {
            this.operation = this.CREATE_OPERATION;

            // Populate empty attributes based on meta-info
            const mandatoryAttributesOnObjectType = this.whoisMetaService.getMandatoryAttributesOnObjectType(this.objectType);
            if (_.isEmpty(mandatoryAttributesOnObjectType)) {
                this.router.navigate(["not-found"]);
                return;
            }

            this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, mandatoryAttributesOnObjectType);
            this.fetchDataForCreate();

        } else {
            this.operation = this.MODIFY_OPERATION;

            // Start empty, and populate with rest-result
            this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, []);

            this.fetchDataForModify();
        }
        this.showAttrsHelp = this.attributes.map((attr: IAttributeModel) => ({[attr.$$id]: true}));
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
        } else {
            this.attributesAllRendered = true;
            return true;
        }
    }

    /*
     * Select status list for resources based on parent's status.
     */
    public resourceParentFound(parent: any) {
        // get the list of available statuses for the parent
        let parentStatusValue: string;
        let parentStatusAttr: IAttributeModel;
        // if parent wasn't found but we got an event anyway, use the default
        if (parent) {
            parentStatusAttr = _.find(parent.attributes.attribute, (attr: IAttributeModel) => {
                return "status" === attr.name;
            });
            if (parentStatusAttr && parentStatusAttr.value) {
                parentStatusValue = parentStatusAttr.value;
            }
        }

        this.optionList.status = this.resourceStatusService.get(this.objectType, parentStatusValue);

        // Allow the user to authorize against mnt-by or mnt-lower of this parent object
        // (https://www.pivotaltracker.com/story/show/118090295)

        // first check if the user needs some auth...
        if (parent && parent.attributes) {
            const parentObject = this.whoisResourcesService.validateAttributes(parent.attributes.attribute);
            this.restCallInProgress = true;
            this.mntnerService.getAuthForObjectIfNeeded(parentObject, this.maintainers.sso, this.operation, this.source, this.objectType, this.name)
                .then(() => {
                        this.restCallInProgress = false;
                        this.inetnumParentAuthError = false;
                    }, (error: any) => {
                        this.restCallInProgress = false;
                        console.error("MntnerService.getAuthForObjectIfNeeded rejected authorisation: ", error);
                        if (!this.inetnumParentAuthError) {
                            this.alertsComponent.addGlobalError("Failed to authenticate parent resource");
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
    public shouldShowBellIcon(attribute: any) {
        return attribute.name === "abuse-c" && !attribute.value;
    }

    public createRoleForAbuseCAttribute(abuseAttr: any) {
        const maintainers = _.map(this.maintainers.object, (o: any) => {
            return {name: "mnt-by", value: o.key};
        });
        abuseAttr.$$error = undefined;
        abuseAttr.$$success = undefined;
        const inputData = {
            maintainers: maintainers,
            passwords: this.credentialsService.getPasswordsForRestCall(this.objectType),
            source: this.source
        };
        const modalRef = this.modalService.open(ModalCreateRoleForAbuseCComponent, {size: "lg"});
        modalRef.componentInstance.inputData = inputData;
        modalRef.result.then((roleAttrs: any) => {
            this.roleForAbuseC = this.whoisResourcesService.wrapAndEnrichAttributes("role", roleAttrs);
            const nicHdl =  this.whoisResourcesService.getSingleAttributeOnName(this.roleForAbuseC, "nic-hdl").value;
            this.attributes = this.whoisResourcesService.setSingleAttributeOnName(this.attributes, "abuse-c", nicHdl);
            abuseAttr.$$success = "Role object for abuse-c successfully created";
        }, (error: any) => {
            if (error !== "cancel") { // dismissing modal will hit this function with the string "cancel" in error arg
                // TODO: pass more specific errors from REST? [RM]
                abuseAttr.$$error = "The role object for the abuse-c attribute was not created";
            }
        });
    }

    public onMntnerAdded(item: any) {

        // enrich with new-flag
        this.maintainers.object = this.mntnerService.enrichWithNewStatus(this.maintainers.objectOriginal, this.maintainers.object);

        // adjust attributes
        this.copyAddedMntnerToAttributes(item.key);

        if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
            this.performAuthentication();
            return;
        }
    }

    public showMntCloseButton(mntner: IMntByModel): boolean {
        return !this.isModifyWithSingleMntnerRemaining() && this.isRemovable(mntner.key) && !this.isLirObject();
    }

    public isClearable(): boolean {
        return this.maintainers.object[0] ? this.showMntCloseButton(this.maintainers.object[0]) : false;
    }

    public onMntnerRemoved(item: any) {

        if (this.maintainers.object.length === 0) {
            // make sure we do not remove the last mntner which act as anchor
            this.keepSingleMntnerInAttrsWithoutValue();
        } else {
            // remove it from the attributes right away
            this.removeMntnerFromAttrs(item);
        }

        console.debug("onMntnerRemoved: " + JSON.stringify(item) + " object mntners now:" + JSON.stringify(this.maintainers.object));
        console.debug("onMntnerRemoved: attributes" + JSON.stringify(this.attributes));
    }

    public isModifyWithSingleMntnerRemaining() {
        return this.operation === this.MODIFY_OPERATION && this.maintainers.object.length === 1;
    }

    public mntnerAutocomplete(query: any) {
        // need to typed characters
        this.restService.autocomplete("mnt-by", query, true, ["auth"])
            .then((data: any[]) => {
                    // mark new
                    this.maintainers.alternatives = this.mntnerService.stripNccMntners(
                        this.mntnerService.enrichWithNewStatus(this.maintainers.objectOriginal,
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
                // When we're using an as-name then we"ll need 1st descr as well (pivotal#116279723)
                name = (_.isArray(item.descr) && item.descr.length)
                    ? [item["as-name"], separator, item.descr[0]].join("")
                    : item["as-name"];
            } else if (_.isString(item["org-name"])) {
                name = item["org-name"];
            } else if (_.isArray(item.descr)) {
                name = item.descr.join("");
            } else if (_.isArray(item.owner)) {
                name = item.owner.join("");
            } else {
                separator = "";
            }
            // item.readableName = this.$sce.trustAsHtml(this.escape(item.key + separator + name));
            item.readableName = this.escape(item.key + separator + name);
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
        return this.enumService.get(this.objectType, attribute.name);
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

    public autocompleteAttribute = (attribute: IAttributeModel) => (text$: Observable<string>) =>
        // value.key as value.readableName for value in referenceAutocomplete(attribute, $viewValue)
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            mergeMap((term) => this.referenceAutocomplete(attribute, term)),
            map((terms: any[]) => terms.map((term: any) => term))
        );

    // for chosen item from list put key, otherwise is  value
    public autocompleteAttributeIFormatter = (result: any) => result.key ? result.key : result;
    public autocompleteAttributeRFormatter = (result: any) => result.readableName;

    public referenceAutocomplete(attribute: IAttributeModel, userInput: string): any {
        const attrName = attribute.name;
        const refs = attribute.$$meta.$$refs;
        const utf8Substituted = this.warnForNonSubstitutableUtf8(attribute, userInput);
        if (utf8Substituted && this.isServerLookupKey(refs)) {

            return this.restService.autocompleteAdvanced(of(userInput), refs)
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
        return this.isServerLookupKey(attribute.$$meta.$$refs) || attribute.$$meta.$$isEnum;
    }

    public fieldVisited(attribute: any) {
        // FIXME dirty hack to allow model from ngbTypeahead to be set on attribute.value
        if (attribute.value && attribute.value.key) {
            attribute.value = attribute.value.key;
        }
        if (attribute.name === "person") {
            attribute.$$error = (!attribute.value || this.personRe.exec(attribute.value)) ? "" : "Input contains unsupported characters.";
            attribute.$$invalid = !!attribute.$$error;
        }
        // Verify if primary-key not already in use
        if (this.operation === this.CREATE_OPERATION && attribute.$$meta.$$primaryKey === true) {
            const value = attribute.name === "inet6num"? attribute.value.replace(/((?::0\b){2,}):?(?!\S*\b\1:0\b)(\S*)/, "::$2") : attribute.value;
            this.restService.autocomplete(attribute.name, value, true, [])
                .then((data: any) => {
                    if (_.some(data, (item: any) => {
                        return this.uniformed(item.type) === this.uniformed(attribute.name) &&
                            this.uniformed(item.key) === this.uniformed(value);
                    })) {
                        attribute.$$error = attribute.name + " " +
                            this.linkService.getModifyLink(this.source, this.objectType, value) +
                            " already exists";
                    } else {
                        attribute.$$error = "";
                    }
                }, (error: any) => {
                    console.error("Autocomplete error " + JSON.stringify(error));
                });
        }

        if (this.operation === this.CREATE_OPERATION && attribute.value) {
            if (this.objectType === "aut-num" && attribute.name === "aut-num" ||
                this.objectType === "inetnum" && attribute.name === "inetnum" ||
                this.objectType === "inet6num" && attribute.name === "inet6num") {
                this.restService.fetchParentResource(this.objectType, attribute.value)
                    .then((result: any) => {
                        let parent;
                        if (result && result.objects && _.isArray(result.objects.object)) {
                            parent = result.objects.object[0];
                        }
                        this.resourceParentFound(parent);
                    }, () => {
                        this.resourceParentFound(null);
                    });
            }
        }
    }

    private uniformed(input: string) {
        if (_.isUndefined(input)) {
            return input;
        }
        return _.trim(input).toUpperCase();
    }

    public canAttributeBeDuplicated(attr: IAttributeModel) {
        return this.whoisResourcesService.canAttributeBeDuplicated(attr) && !attr.$$meta.$$isLir && !attr.$$meta.$$disable;
    }

    public duplicateAttribute(attr: IAttributeModel) {
        this.addDuplicateAttr(this.attributes, attr, attr.name);
    }

    private addDuplicateAttr(attributes: IAttributeModel[], attribute: IAttributeModel, attributeName: string) {
        let foundIdx = -1;
        if (attribute.$$id) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attribute.$$id === attr.$$id;
            });
        }
        // if id wasn't found, find match on name/value.
        if (foundIdx < 0) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attr.name === attribute.name && attr.value === attribute.value;
            });
        }
        if (foundIdx > -1) {
            attributes.splice(foundIdx + 1, 0, {name: attributeName, value: undefined});
            this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, attributes);
        }
    }

    public canAttributeBeRemoved(attr: any) {
        return this.whoisResourcesService.canAttributeBeRemoved(this.attributes, attr) && !attr.$$meta.$$isLir && !attr.$$meta.$$disable;
    }

    public removeAttribute(attr: any) {
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.whoisResourcesService.removeAttribute(this.attributes, attr));
    }

    public displayAddAttributeDialog(attr: any) {
        let originalAddableAttributes = this.whoisResourcesService.getAddableAttributes(this.attributes, this.objectType, this.attributes);
        originalAddableAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, originalAddableAttributes);

        const addableAttributes = _.filter(
            this.screenLogicInterceptorService.beforeAddAttribute(this.operation, this.source, this.objectType, this.attributes, originalAddableAttributes),
            (attrPred: any) => {
                return !attrPred.$$meta.$$isLir;
            });

        const modalRef = this.modalService.open(ModalAddAttributeComponent, {size: "lg"});
        modalRef.componentInstance.items = addableAttributes;
        console.debug("openAddAttributeModal for items", addableAttributes);
        modalRef.result.then((selectedItem: any) => {
            console.debug("openAddAttributeModal completed with:", selectedItem);
            this.addSelectedAttribute(selectedItem, attr);
        }, (error) => console.log("openAddAttributeModal completed with:", error));
    }

    public displayEditAttributeDialog(attr: IAttributeModel) {
        const modalRef = this.modalService.open(ModalEditAttributeComponent, {windowClass: "modal-edit-attr"});
        modalRef.componentInstance.attr = attr;
        console.debug("openEditAttributeModal for items", attr);
        modalRef.result.then((selectedItem: any) => {
            console.debug("openEditAttributeModal completed", attr);
        }, (error) => console.log("openEditAttributeModal completed with:", error));
    }

    public addSelectedAttribute(selectedAttributeType: IAttributeModel, attr: IAttributeModel) {
        const attrs = this.whoisResourcesService.addAttributeAfter(this.attributes, selectedAttributeType, attr);
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, attrs);
    }

    public displayMd5DialogDialog(attr: IAttributeModel) {
        const modalRef = this.modalService.open(ModalMd5PasswordComponent, {size: "lg"});
        console.debug("openMd5Modal");
        modalRef.result.then((md5Value: any) => {
            console.debug("openMd5Modal completed with:", md5Value);
            attr.value = md5Value;
        }, (reason: any) => {
            console.debug("openMd5Modal cancelled because: " + reason);
        });
    }

    public isResourceWithNccMntner() {
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            return _.some(this.maintainers.objectOriginal, (mntner: any) => {
                return this.mntnerService.isNccMntner(mntner.key);
            });
        }
        return false;
    }

    public deleteObject() {
        this.webUpdatesCommonsService.navigateToDelete(this.source, this.objectType, this.name, STATE.MODIFY);
    }

    public submit() {

        const onSubmitSuccess = (whoisResources: any) => {
            this.restCallInProgress = false;

            // Post-process attribute after submit-success using screen-logic-interceptor
            if (this.interceptOnSubmitSuccess(this.operation, this.whoisResourcesService.getAttributes(whoisResources)) === false) {

                // It's ok to just let it happen or fail.
                this.organisationHelperService.updateAbuseC(this.source, this.objectType, this.roleForAbuseC, this.attributes);

                const primaryKey = this.whoisResourcesService.getPrimaryKey(whoisResources);
                // stick created object in temporary store, so display-screen can fetch it from here
                this.messageStoreService.add(primaryKey, whoisResources);

                // make transition to next display screen
                this.webUpdatesCommonsService.navigateToDisplay(this.source.toUpperCase(), this.objectType, primaryKey, this.operation);
            }
        };

        const onSubmitError = (resp: any) => {

            const whoisResources = resp.data;
            const errorMessages: string[] = [];
            const warningMessages: string[] = [];
            const infoMessages: string[] = [];

            this.restCallInProgress = false;
            this.attributes = this.whoisResourcesService.getAttributes(whoisResources);

            // This interceptor allows us to convert error into success
            // This could change in the future
            const intercepted = this.screenLogicInterceptorService.afterSubmitError(this.operation,
                this.source, this.objectType,
                resp.status, resp.data,
                errorMessages, warningMessages, infoMessages);

            // Post-process attribute after submit-error using screen-logic-interceptor
            if (intercepted) {
                this.loadAlerts(errorMessages, warningMessages, infoMessages);
                /* Instruct downstream screen (typically display screen) that object is in pending state */
                this.webUpdatesCommonsService.navigateToDisplay(this.source, this.objectType,
                    this.whoisResourcesService.getPrimaryKey(whoisResources), this.PENDING_OPERATION);
            } else {
                this.validateForm();
                const firstErr = this.alertsComponent.populateFieldSpecificErrors(this.objectType, this.attributes, whoisResources);
                this.alertsComponent.setErrors(whoisResources);
                this.errorReporterService.log(this.operation, this.objectType, this.alertsComponent.getErrors(), this.attributes);
                this.attributes = this.interceptBeforeEdit(this.operation, this.attributes);
                if (firstErr) {
                    const anchor = document.querySelector(`#anchor-${firstErr}`);
                    if (anchor) {
                        anchor.scrollIntoView();
                    }
                }
            }
        };

        // Post-process attributes before submit using screen-logic-interceptor
        this.attributes = this.interceptAfterEdit(this.operation, this.attributes);

        if (!this.validateForm()) {
            this.errorReporterService.log(this.operation, this.objectType, this.alertsComponent.getErrors(), this.attributes);
        } else {
            this.stripNulls();
            this.alertsComponent.clearErrors();

            if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                this.performAuthentication();
                return;
            }

            const passwords = this.credentialsService.getPasswordsForRestCall(this.objectType);

            this.restCallInProgress = true;

            AttributeMetadataService.splitAttrsCommentsFromValue(this.attributes, true);

            if (!this.name) {
                this.restService.createObject(this.source, this.objectType, this.whoisResourcesService.turnAttrsIntoWhoisObject(this.attributes), passwords)
                    .subscribe(
                        onSubmitSuccess,
                        onSubmitError);

            } else {
                // TODO: Temporary function till RPSL clean up
                if (this.mntnerService.isLoneRpslMntner(this.maintainers.objectOriginal)) {
                    passwords.push("RPSL");
                }

                this.restService.modifyObject(this.source, this.objectType, this.name, this.whoisResourcesService.turnAttrsIntoWhoisObject(this.attributes), passwords)
                    .subscribe(
                        onSubmitSuccess,
                        onSubmitError);
            }
        }
    }

    public switchToTextMode() {
        console.debug("Switching to text-mode");

        this.preferenceService.setTextMode();
        if (!this.name) {
            this.router.navigateByUrl(`textupdates/create/${this.source}/${this.objectType}`);
        } else {
            this.router.navigateByUrl(`textupdates/modify/${this.source}/${this.objectType}/${encodeURIComponent(this.name)}`);
        }
    }

    public cancel() {
        if (this.window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.router.navigate(["webupdates/select"]);
        }
    }

    public getAttributeShortDescription(attrName: string) {
        return this.whoisMetaService.getAttributeShortDescription(this.objectType, attrName);
    }

    public isLirObject() {
        return ObjectUtilService.isLirObject(this.attributes);
    }

    public isMine(mntner: IMntByModel) {
        return this.mntnerService.isMine(mntner);
    }

    public isRemovable(mntnerKey: string) {
        return this.mntnerService.isRemovable(mntnerKey);
    }

    public hasSSo(mntner: IMntByModel) {
        return this.mntnerService.hasSSo(mntner);
    }

    public hasPgp(mntner: IMntByModel) {
        return this.mntnerService.hasPgp(mntner);
    }

    public hasMd5(mntner: IMntByModel) {
        return this.mntnerService.hasMd5(mntner);
    }

    public isNew(mntner: any) {
        return this.mntnerService.isNew(mntner);
    }


    public isFormValid() {
        return !this.inetnumParentAuthError && this.whoisResourcesService.validateWithoutSettingErrors(this.attributes);
    }

    public setVisibilityAttrsHelp(attributeId: string) {
        this.showAttrsHelp[attributeId] = !this.showAttrsHelp[attributeId]
    }

    /*
     * private methods
     */
    private warnForNonSubstitutableUtf8(attribute: any, userInput: string) {
        if (!this.charsetToolsService.isLatin1(userInput)) {
            // see if any chars can be substituted
            const subbedValue = this.charsetToolsService.replaceSubstitutables(userInput);
            if (!this.charsetToolsService.isLatin1(subbedValue)) {
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
        this.restService.fetchMntnersForSSOAccount()
            .subscribe((results: any) => {
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

                    attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType,
                        this.whoisResourcesService.addAttrsSorted(this.attributes, "mnt-by", mntnerAttrs));

                    // Post-process atttributes before showing using screen-logic-interceptor
                    this.attributes = this.interceptBeforeEdit(this.CREATE_OPERATION, attributes);

                    console.debug("mntnrs-sso:" + JSON.stringify(this.maintainers.sso));
                    console.debug("mntn rs-object-original:" + JSON.stringify(this.maintainers.objectOriginal));
                    console.debug("mntners-object:" + JSON.stringify(this.maintainers.object));

                } else {
                    attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.attributes);
                    this.attributes = this.interceptBeforeEdit(this.CREATE_OPERATION, attributes);
                }
            }, (error: any) => {
                this.restCallInProgress = false;
                console.error("Error fetching mntners for SSO:" + JSON.stringify(error));
                this.alertsComponent.setGlobalError("Error fetching maintainers associated with this SSO account");
            });
    }

    private loadAlerts(errorMessages: string[], warningMessages: string[], infoMessages: string[]) {
        errorMessages.forEach((error: string) => {
            this.alertsComponent.addGlobalError(error);
        });

        warningMessages.forEach((warning: string) => {
            this.alertsComponent.addGlobalWarning(warning);
        });

        infoMessages.forEach((info: string) => {
            this.alertsComponent.addGlobalInfo(info);
        });
    }

    private interceptBeforeEdit(method: string, attributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];
        const interceptedAttrs = this.screenLogicInterceptorService.beforeEdit(method,
            this.source, this.objectType, attributes,
            errorMessages, warningMessages, infoMessages);

        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private interceptAfterEdit(method: string, attributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];
        const interceptedAttrs = this.screenLogicInterceptorService.afterEdit(method,
            this.source, this.objectType, attributes,
            errorMessages, warningMessages, infoMessages);

        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private interceptOnSubmitSuccess(method: string, responseAttributes: any[]) {
        const errorMessages: string[] = [];
        const warningMessages: string[] = [];
        const infoMessages: string[] = [];

        const interceptedAttrs = this.screenLogicInterceptorService.afterSubmitSuccess(method,
            this.source, this.objectType, responseAttributes,
            warningMessages, infoMessages);
        this.loadAlerts(errorMessages, warningMessages, infoMessages);

        return interceptedAttrs;
    }

    private fetchDataForModify() {

        let password = null;
        if (this.credentialsService.hasCredentials()) {
            password = this.credentialsService.getCredentials().successfulPassword;
        }
        // wait until both have completed
        this.restCallInProgress = true;
        const mntners = this.restService.fetchMntnersForSSOAccount();
        const objectToModify = this.restService.fetchObject(this.source, this.objectType, this.name, password);
        forkJoin([mntners, objectToModify])
            .subscribe(response => {
                const mntnersResponse = response[0];
                const objectToModifyResponse = response[1];
                this.restCallInProgress = false;
                console.debug("[createModifyController] object to modify: " + JSON.stringify(objectToModifyResponse));

                // store mntners for SSO account
                this.maintainers.sso = mntnersResponse;
                console.debug("maintainers.sso:" + JSON.stringify(this.maintainers.sso));

                // store object to modify
                this.attributes = this.whoisResourcesService.getAttributes(objectToModifyResponse);
                this.attributeMetadataService.enrich(this.objectType, this.attributes);

                // Create empty attribute with warning for each missing mandatory attribute
                this.insertMissingMandatoryAttributes();

                // save object for later diff in display-screen
                this.messageStoreService.add("DIFF", _.cloneDeep(this.attributes));

                // prevent warning upon modify with last-modified
                this.whoisResourcesService.removeAttributeWithName(this.attributes, "last-modified");

                // this is where we must authenticate against
                this.maintainers.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);

                // starting point for further editing
                this.maintainers.object = this.extractEnrichMntnersFromObject(this.attributes);

                // Post-process attribute before showing using screen-logic-interceptor
                this.attributes = this.interceptBeforeEdit(this.MODIFY_OPERATION, this.attributes);

                // fetch details of all selected maintainers concurrently
                this.restCallInProgress = true;
                this.restService.detailsForMntners(this.maintainers.object).then((result: any[]) => {
                    this.restCallInProgress = false;

                    // result returns an array for each mntner

                    this.maintainers.objectOriginal = _.flatten(result);
                    console.debug("mntners-object-original:" + JSON.stringify(this.maintainers.objectOriginal));

                    // of course none of the initial ones are new
                    this.maintainers.object = this.mntnerService.enrichWithNewStatus(this.maintainers.objectOriginal, _.flatten(result));
                    console.debug("mntners-object:" + JSON.stringify(this.maintainers.object));

                    if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                        this.performAuthentication();
                    }
                }, (error: any) => {
                    this.restCallInProgress = false;
                    console.error("Error fetching sso-mntners details" + JSON.stringify(error));
                    this.alertsComponent.setGlobalError("Error fetching maintainer details");
                });
                // now let's see if there are any read-only restrictions on these attributes. There is if any of
                // these are true:
                //
                // * this is an inet(6)num and it has a "sponsoring-org" attribute which refers to an LIR
                // * this is an inet(6)num and it has a "org" attribute which refers to an LIR
                // * this is an organisation with an "org-type: LIR" attribute and attribute.name is address|fax|e-mail|phone
            },(error: any) => {
                this.restCallInProgress = false;
                try {
                    const whoisResources = error.data;
                    this.wrapAndEnrichResources(this.objectType, error.data);
                    this.alertsComponent.setErrors(whoisResources);
                } catch (e) {
                    console.error("Error fetching sso-mntners for SSO:" + JSON.stringify(error));
                    this.alertsComponent.setGlobalError("Error fetching maintainers associated with this SSO account");
                }
            },
        );
    }

    private insertMissingMandatoryAttributes() {
        const missingMandatories = this.whoisResourcesService.getMissingMandatoryAttributes(this.attributes, this.objectType);
        if (missingMandatories.length > 0) {
            _.each(missingMandatories, (item) => {
                this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType,
                    this.whoisResourcesService.addMissingMandatoryAttribute(this.attributes, this.objectType, item));
            });
            this.validateForm();
        }
    }

    private copyAddedMntnerToAttributes(mntnerName: string) {
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.whoisResourcesService.addAttrsSorted(this.attributes, "mnt-by", [
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
                mine: _.includes(_.map(this.maintainers.sso, "key"), mntnerAttr.value),
                type: "mntner",
            };
        });
    }

    private filterAutocompleteMntners(mntners: any[]) {
        return _.filter(mntners, (mntner) => {
            // prevent that RIPE-NCC mntners can be added to an object upon create of modify
            // prevent same mntner to be added multiple times
            return !this.mntnerService.isNccMntner(mntner.key) && !this.mntnerService.isMntnerOnlist(this.maintainers.object, mntner);
        });
    }

    private validateForm() {
        return this.whoisResourcesService.validate(this.attributes)
            && this.organisationHelperService.validateAbuseC(this.objectType, this.attributes);
    }

    private hasErrors() {
        return this.alertsComponent.hasErrors();
    }

    private stripNulls() {
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.whoisResourcesService.removeNullAttributes(this.attributes));
    }

    private wrapAndEnrichResources(objectType: string, resp: any) {
        const whoisResources = this.whoisResourcesService.validateWhoisResources(resp);
        if (whoisResources) {
            this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(objectType, this.whoisResourcesService.getAttributes(whoisResources));
        }
        return whoisResources;
    }

    private enrichWithMine(mntners: any[]) {
        return _.map(mntners, (mntner: any) => {
            // search in selected list
            mntner.mine = !!this.mntnerService.isMntnerOnlist(this.maintainers.sso, mntner);
            return mntner;
        });
    }

    public showPencile(attrName: string): boolean {
        const modalContactFields = ["address", "org-name", "phone", "fax-no", "e-mail"];
        return modalContactFields.indexOf(attrName) > -1;
    }

    private refreshObjectIfNeeded(associationResp: any) {
        if (this.operation === this.MODIFY_OPERATION && this.objectType === "mntner") {
            if (associationResp) {
                this.wrapAndEnrichResources(this.objectType, associationResp);
                // save object for later diff in display-screen
                this.messageStoreService.add("DIFF", this.attributes);
            } else {
                let password = null;
                if (this.credentialsService.hasCredentials()) {
                    password = this.credentialsService.getCredentials().successfulPassword;
                }
                this.restCallInProgress = true;
                this.restService.fetchObject(this.source, this.objectType, this.name, password)
                    .subscribe((result: any) => {
                            this.restCallInProgress = false;

                            this.attributes = this.whoisResourcesService.getAttributes(result);

                            // save object for later diff in display-screen
                            this.messageStoreService.add("DIFF", _.cloneDeep(this.attributes));

                            console.debug("sso-ntners:" + JSON.stringify(this.maintainers.sso));
                            console.debug("objectMaintainers:" + JSON.stringify(this.maintainers.object));

                        }, () => {
                            this.restCallInProgress = false;
                        },
                    );
            }
            this.maintainers.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);
            this.maintainers.object = this.extractEnrichMntnersFromObject(this.attributes);
        }
    }

    private navigateAway = () => {
        if (this.operation === this.MODIFY_OPERATION) {
            this.webUpdatesCommonsService.navigateToDisplay(this.source, this.objectType, this.name, undefined);
        }
    };

    private performAuthentication() {
        const authParams = {
            failureClbk: this.navigateAway,
            isLirObject: ObjectUtilService.isLirObject(this.attributes),
            maintainers: this.maintainers,
            object: {
                name: this.name,
                source: this.source,
                type: this.objectType,
            },
            operation: this.operation,
            successClbk: this.onSuccessfulAuthentication,
        };
        this.webUpdatesCommonsService.performAuthentication(authParams);
    }

    private onSuccessfulAuthentication = (associationResp: any) => {
        this.refreshObjectIfNeeded(associationResp);
    }
}