import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, distinctUntilChanged, map, mergeMap} from "rxjs/operators";
import {Observable, of} from "rxjs";
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
import {AlertsService} from "../shared/alert/alerts.service";

interface IOptionList {
    status: IStatusOption[];
}

export interface IMaintainers {
    alternatives$?: Observable<IMntByModel[]>;
    object: IMntByModel[];
    objectOriginal: IMntByModel[];
    sso: IMntByModel[];
}

@Component({
    selector: "create-modify",
    templateUrl: "./create-modify.component.html",
})
export class CreateModifyComponent implements OnInit, OnDestroy {
    public optionList: IOptionList = {status: []};
    public name: string;
    public source: string;
    public objectType: string;
    public maintainers: IMaintainers = {
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

    public showAttrsHelp: [];

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
                public alertsService: AlertsService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
    }

    public ngOnInit() {
        this.optionList = {status: []};

        this.inetnumParentAuthError = false;
        this.restCallInProgress = false;

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
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
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
                            this.alertsService.addGlobalError("Failed to authenticate parent resource");
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

    public updateMaintainers(maintainers: IMaintainers) {
        this.maintainers = maintainers;
        // delete from attributes all maintainers which doesn't exist in maintainers
        _.remove(this.attributes, (attr: any) => {
            return attr.name === "mnt-by" && !maintainers.object.find(mnt => mnt.key === attr.value);
        });
        // add maintainers from maintainers object
        maintainers.object.forEach(mnt => {
            if (!this.attributes.find(attr => attr.name === "mnt-by" && attr.value === mnt.key)) {
                this.attributes = this.whoisResourcesService.addAttrsSorted(this.attributes, "mnt-by", [
                    {name: "mnt-by", value: mnt.key}]);
            }});
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.attributes);
    }

    private addNiceAutocompleteName(items: any[], attrName: string) {
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
                // When we're using an as-name then we'll need 1st descr as well (pivotal#116279723)
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
            // No suggestions since nohandleSsoResponset a reference
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
            this.restService.autocomplete(attribute.name, value, true, []).toPromise()
                .then((data: any) => {
                    if (_.some(data, (item: any) => {
                        return CreateModifyComponent.uniformed(item.type) === CreateModifyComponent.uniformed(attribute.name) &&
                            CreateModifyComponent.uniformed(item.key) === CreateModifyComponent.uniformed(value);
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

    private static uniformed(input: string) {
        if (_.isUndefined(input)) {
            return input;
        }
        return _.trim(input).toUpperCase();
    }

    public canAttributeBeDuplicated(attr: IAttributeModel) {
        return this.whoisResourcesService.canAttributeBeDuplicated(attr) && !attr.$$meta.$$isLir && !attr.$$meta.$$disable;
    }

    public duplicateAttribute(attr: IAttributeModel) {
        this.addAttr(this.attributes, attr, attr.name);
    }

    private addAttr(attributes: IAttributeModel[], attribute: IAttributeModel, attributeName: string) {
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

        const addableAttributes = _.filter(
            this.screenLogicInterceptorService.beforeAddAttribute(this.operation, this.source, this.objectType, this.attributes, originalAddableAttributes),
            (attrPred: any) => {
                return !attrPred.$$meta.$$isLir;
            });

        const modalRef = this.modalService.open(ModalAddAttributeComponent, {size: "lg"});
        modalRef.componentInstance.items = addableAttributes;
        modalRef.result.then((selectedItem: any) => {
            this.addSelectedAttribute(selectedItem, attr);
        }, (error) => console.log("openAddAttributeModal completed with:", error));
    }

    public displayEditAttributeDialog(attr: IAttributeModel) {
        const modalRef = this.modalService.open(ModalEditAttributeComponent, {windowClass: "modal-edit-attr"});
        modalRef.componentInstance.attr = attr;
        console.debug("openEditAttributeModal for items", attr);
        modalRef.result.then(() => {
            console.debug("openEditAttributeModal completed", attr);
        }, (error) => console.log("openEditAttributeModal completed with:", error));
    }

    public addSelectedAttribute(selectedAttributeType: IAttributeModel, attr: IAttributeModel) {
        this.addAttr(this.attributes, attr, selectedAttributeType.name);
        this.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.attributes);
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
            return this.maintainers.objectOriginal.some((mntner: any) => {
                return this.mntnerService.isAnyNccMntner(mntner.key);
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
                const firstErr = this.alertsService.populateFieldSpecificErrors(this.objectType, this.attributes, whoisResources);
                this.alertsService.setErrors(whoisResources);
                this.errorReporterService.log(this.operation, this.objectType, this.alertsService.alerts.errors, this.attributes);
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
            this.errorReporterService.log(this.operation, this.objectType, this.alertsService.alerts.errors, this.attributes);
        } else {
            this.stripNulls();
            this.alertsService.clearAlertMessages();
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

    public isFormValid() {
        this.attributes.map(attr => {if (attr.name === "mnt-by" && attr.value === "") {attr.$$invalid = false}});
        // enrcih is called from maintainer-editor-component so $$invalid get value true and is never changed,
        // because of this validation was crushing
        this.attributes.map(attr => {attr.$$invalid = false});
        return !this.inetnumParentAuthError && this.whoisResourcesService.validateWithoutSettingErrors(this.attributes);
    }

    public setVisibilityAttrsHelp(attributeName: string) {
        this.showAttrsHelp[attributeName] = !this.showAttrsHelp[attributeName]
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
                } else {
                    attributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.objectType, this.attributes);
                }
                // Post-process attributes before showing using screen-logic-interceptor
                this.attributes = this.interceptBeforeEdit(this.CREATE_OPERATION, attributes);
                this.showAttrsHelp = this.attributes.map((attr: IAttributeModel) => ({[attr.name]: true}));
            }, (error: any) => {
                this.restCallInProgress = false;
                console.error("Error fetching mntners for SSO:" + JSON.stringify(error));
                this.alertsService.setGlobalError("Error fetching maintainers associated with this SSO account");
            });
    }

    private loadAlerts(errorMessages: string[], warningMessages: string[], infoMessages: string[]) {
        errorMessages.forEach((error: string) => {
            this.alertsService.addGlobalError(error);
        });

        warningMessages.forEach((warning: string) => {
            this.alertsService.addGlobalWarning(warning);
        });

        infoMessages.forEach((info: string) => {
            this.alertsService.addGlobalInfo(info);
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
        this.restService.fetchObject(this.source, this.objectType, this.name, password)
            .subscribe(objectToModifyResponse => {
                this.restCallInProgress = false;
                console.debug("[createModifyController] object to modify: " + JSON.stringify(objectToModifyResponse));

                // store object to modify
                this.attributes = this.whoisResourcesService.getAttributes(objectToModifyResponse);
                this.attributeMetadataService.enrich(this.objectType, this.attributes);

                // show description under fields
                this.showAttrsHelp = this.attributes.map((attr: IAttributeModel) => ({[attr.name]: true}));

                // Create empty attribute with warning for each missing mandatory attribute
                this.insertMissingMandatoryAttributes();

                // save object for later diff in display-screen
                this.messageStoreService.add("DIFF", _.cloneDeep(this.attributes));

                // prevent warning upon modify with last-modified
                this.whoisResourcesService.removeAttributeWithName(this.attributes, "last-modified");

                // Post-process attribute before showing using screen-logic-interceptor
                this.attributes = this.interceptBeforeEdit(this.MODIFY_OPERATION, this.attributes);

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
                    this.alertsService.setErrors(whoisResources);
                } catch (e) {
                    console.error("Error fetching sso-mntners for SSO:" + JSON.stringify(error));
                    this.alertsService.setGlobalError("Error fetching maintainers associated with this SSO account");
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

    private validateForm() {
        return this.whoisResourcesService.validate(this.attributes)
            && this.organisationHelperService.validateAbuseC(this.objectType, this.attributes);
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

    public showPencile(attrName: string): boolean {
        const modalContactFields = ["address", "org-name", "phone", "fax-no", "e-mail"];
        return modalContactFields.indexOf(attrName) > -1;
    }

    public refreshObjectIfNeeded(associationResp: any) {
        if (this.operation === this.MODIFY_OPERATION && this.objectType === "mntner") {
            if (associationResp) {
                this.wrapAndEnrichResources(this.objectType, associationResp);
                // save object for later diff in display-screen
                this.messageStoreService.add("DIFF",  _.cloneDeep(this.attributes));
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

                        }, () => {
                            this.restCallInProgress = false;
                        },
                    );
            }
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
