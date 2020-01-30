import {Component, ViewChild} from "@angular/core";
import {catchError, map} from "rxjs/operators";
import {Observable, of, throwError} from "rxjs";
import * as _ from "lodash";
import {Router} from "@angular/router";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {RestService} from "../updates/rest.service";
import {ErrorReporterService} from "../updates/error-reporter.service";
import {RpslService} from "./rpsl.service";
import {SerialExecutorService} from "./serial-executor.service";
import {AutoKeyLogicService} from "./auto-key-logic.service";
import {PreferenceService} from "../updates/preference.service";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {TextCommonsService} from "./text-commons.service";
import {ITextObject} from "./text-create.component";
import {IWhoisResponseModel} from "../shared/whois-response-type.model";
import {PropertiesService} from "../properties.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

interface ITextMultiObject {
    deleteReason: string;
    errors: string[];
    override: string;
    passwords: string;
    showDiff: boolean;
    type?: string;
    name?: string;
    rpsl?: string;
    exists?: boolean;
    attributes?: any;
    displayUrl?: string;
    textupdatesUrl?: string;
    rpslOriginal?: any;
}

@Component({
    selector: "text-multi",
    templateUrl: "./text-multi.component.html",
})
export class TextMultiComponent {

    public actionsPending: number = 0;
    public restCallInProgress: boolean = false;
    public textMode: boolean = true;
    public objects: ITextObject = {
        objects: [],
        source: "",
        type: "",
    };
    public mntners: any;
    public name: string;
    public override: string;
    public passwords: string;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(private router: Router,
                public whoisResourcesService: WhoisResourcesService,
                public whoisMetaService: WhoisMetaService,
                public restService: RestService,
                public errorReporterService: ErrorReporterService,
                public rpslService: RpslService,
                public textCommonsService: TextCommonsService,
                public serialExecutorService: SerialExecutorService,
                public autoKeyLogicService: AutoKeyLogicService,
                public properties: PropertiesService,
                public preferenceService: PreferenceService) {
    }

    public ngOnInit() {
        this.actionsPending = 0;

        this.alertsComponent.clearErrors();

        // extract parameters from the url
        this.objects.source = this.properties.SOURCE;
        this.objects.rpsl = "";

        console.debug("TextMultiController: Url params:" +
            " object.source:" + this.objects.source);

        // start in text-mode
        this.setTextMode();
    }

    public setWebMode() {
        this.alertsComponent.clearErrors();

        console.info("TextMultiController.setWebMode: source" + this.objects.source + ", rpsl:" + this.objects.rpsl);

        if (!this.hasValidRpsl()) {
            this.alertsComponent.setGlobalError("No valid RPSL found");
            return;
        }

        const parsedObjs = this.rpslService.fromRpsl(this.objects.rpsl);
        if (parsedObjs.length === 0) {
            this.alertsComponent.setGlobalError("No valid RPSL object(s) found");
            return;
        }

        console.debug("parsed rpsl:" + JSON.stringify(parsedObjs));
        this.textMode = false;
        this.objects.objects = this.verify(this.objects.source, this.objects.rpsl, parsedObjs);
    }

    public setTextMode() {
        this.textMode = true;
        this.objects.objects = [];
    }

    public isTextMode() {
        return this.textMode === true;
    }

    public didAllActionsComplete() {
        return this.actionsPending === 0;
    }

    public didAllActionsSucceed() {
        const successes = _.filter(this.objects.objects, (obj: any) => {
            return obj.success === true;
        });

        return successes.length === this.objects.objects.length;
    }

    public startFresh() {
        this.ngOnInit();
    }

    public onRpslTyped() {
        console.debug("Typed RPSL:" + this.objects.rpsl);
    }

    public useOld() {
        this.preferenceService.setPoorSyncupdatesMode();
        this.router.navigate([this.properties.DATABASE_SYNCUPDATES_URL]);
    }

    public submit() {
        this.alertsComponent.clearErrors();

        console.debug("submit:" + JSON.stringify(this.objects.objects));

        this.initializeActionCounter(this.objects.objects);

        // Execute any by one so that AUT0-keys can be resolved
        this.serialExecutorService.execute(this.objects.objects, this.submitSingle);
    }

    private submitSingle = (object: any): Promise<any> => {
        if (object.success === true) {
            this.markActionCompleted(object, this.determineAction(object) + " already performed");
            return of(object).toPromise();
        } else {
            this.setStatus(object, undefined, "Start " + this.determineAction(object));
            return this.performAction(this.objects.source, object)
                .then((whoisResources: IWhoisResponseModel) => {
                        object.name = this.whoisResourcesService.getPrimaryKey(whoisResources);
                        object.attributes = this.whoisResourcesService.getAttributes(whoisResources);
                        const obj = {
                            attributes: object.attributes,
                            deleteReason: object.deleteReason,
                            override: object.override,
                            passwords: object.passwords,
                        };
                        object.rpsl = this.rpslService.toRpsl(obj);
                        if (object.deleted !== true) {
                            object.displayUrl = this.asDisplayLink(this.objects.source, object);
                        }
                        object.textupdatesUrl = undefined;
                        object.errors = [];
                        object.warnings = this.whoisResourcesService.getAllWarnings(whoisResources);
                        object.infos = this.whoisResourcesService.getAllInfos(whoisResources);

                        this.markActionCompleted(object, this.determineAction(object) + " success", true);

                        return object;
                    }, (whoisResources: any) => {
                        if (!_.isUndefined(whoisResources)) {
                            object.errors = this.whoisResourcesService.getAllErrors(whoisResources);
                            object.warnings = this.whoisResourcesService.getAllWarnings(whoisResources);
                            object.infos = this.whoisResourcesService.getAllInfos(whoisResources);
                        }

                        this.markActionCompleted(object, this.determineAction(object) + " failed", true);

                        return throwError(object)
                    },
                );
        }
    };

    private verify(source: string, rpsl: any, parsedObjs: any) {
        const objects: ITextMultiObject[] = [];
        this.autoKeyLogicService.clear();
        this.initializeActionCounter(parsedObjs);

        _.each(parsedObjs, (parsedObj) => {

            // create a new object and add it to the array right away
            const object: ITextMultiObject = {
                deleteReason: parsedObj.deleteReason,
                errors: [],
                override: parsedObj.override,
                passwords: parsedObj.passwords,
                showDiff: false,
            };
            objects.push(object);

            const attrs = this.textCommonsService.uncapitalize(parsedObj.attributes);

            // assume nam of first attribute is type indicator
            object.type = this.determineObjectType(attrs);

            // back to rpsl
            object.rpsl = this.rpslService.toRpsl(parsedObj);

            console.info("object:" + JSON.stringify(object));

            // validate
            if (!this.textCommonsService.validate(object.type, attrs, object.errors)) {
                console.info("validation error:" + JSON.stringify(object.errors));
                this.setStatus(object, false, "Invalid syntax");
                this.markActionCompleted(object, "syntax error");
            } else {
                // determine primary key pf object
                object.attributes = this.whoisResourcesService.wrapAndEnrichAttributes(object.type, attrs);
                object.name = this.getPkey(object.type, object.attributes);

                // find out if this object has AUTO-keys
                this.autoKeyLogicService.identifyAutoKeys(object.type, attrs);

                // start fetching to determine if exists
                this.setStatus(object, undefined, "Fetching");
                object.exists = undefined;
                this.doesExist(source, object, object.passwords)
                    .then((exists: any) => {
                        if (exists === true) {
                            object.exists = true;
                            this.setStatus(object, undefined, "Object exists");
                            object.displayUrl = this.asDisplayLink(source, object);
                        } else {
                            object.exists = false;
                            this.setStatus(object, undefined, "Object does not yet exist");
                            object.displayUrl = undefined;
                        }
                        object.textupdatesUrl = this.asTextUpdatesLink(source, object);
                        this.markActionCompleted(object, "fetch");
                    }, (errors: any) => {
                        this.setStatus(object, false, "Error fetching");
                        this.markActionCompleted(object, "fetch");
                        object.errors = errors;
                        return of();
                    },
                );
            }
        });
        return objects;
    }

    private determineObjectType(attributes: any) {
        return attributes[0].name;
    }

    private doesExist(source: string, object: ITextMultiObject, passwords: string): Promise<boolean> {
        if (_.isUndefined(object.name) || _.isEmpty(object.name) || _.startsWith(_.trim(object.name), "AUTO-")) {
            console.info("Need need to perform fetch to check if exists");
            return of(false).toPromise();
        } else {
            // TODO fetch with override
            return this.restService.fetchObject(source, object.type, object.name, passwords, true)
                .pipe(
                    map((result: any) => {
                        console.debug("Successfully fetched object " + object.name);
                        // store original value to make diff-view later
                        object.rpslOriginal = this.rpslService.toRpsl({attributes: this.whoisResourcesService.getAttributes(result)});
                        return true
                    }),
                    catchError((error: any, caught: Observable<any>) => {
                        console.debug("Error fetching object " + object.name + ", http-status:" + error.status);
                        object.rpslOriginal = undefined;
                        if (error.status === 404) {
                            return of(false);
                        } else {
                            return throwError(this.whoisResourcesService.getAllErrors(error.data));
                        }
                    })).toPromise();
        }
    }

    private performAction(source: string, object: any): Promise<any> {
        if (object.errors.length > 0) {
            console.debug("Skip performing action " + this.determineAction(object) + "-" + object.type + "-" + object.name + " since has errors");
            return throwError(undefined).toPromise();
        } else {
            console.debug("Start performing action " + this.determineAction(object) + "-" + object.type + "-" + object.name);

            // replace auto-key with real generated key
            this.autoKeyLogicService.substituteAutoKeys(object.attributes);

            // find attrs with an auto key
            const autoAttrs = this.autoKeyLogicService.getAutoKeys(object.attributes);

            // might have changed due to auto-key
            const oldName = _.trim(object.name);
            object.name = _.trim(this.getPkey(object.type, object.attributes));
            if (_.startsWith(oldName, "AUTO-") && !_.startsWith(object.name, "AUTO-")) {
                object.exists = true;
            }

            if (!_.isUndefined(object.deleteReason)) {
                // TODO: add support for delete override
                return this.restService.deleteObject(source, object.type, object.name, object.deleteReason, false,
                    object.passwords, false)
                    .pipe(
                        map((result: any) => {
                            object.deleted = true;
                            object.exists = false;
                            this.setStatus(object, true, "Delete success");

                            return result;
                        }),
                        catchError((error: any, caught: Observable<any>) => {
                            this.setStatus(object, false, "Delete error");

                            if (!_.isEmpty(this.whoisResourcesService.getAttributes(error.data))) {
                                this.errorReporterService.log("MultiDelete", object.type, this.alertsComponent.getErrors(), this.whoisResourcesService.getAttributes(error.data));
                            }
                            return throwError(error.data);
                        })).toPromise();
            } else if (object.exists === false) {

                return this.restService.createObject(source, object.type, this.whoisResourcesService.turnAttrsIntoWhoisObject(object.attributes), object.passwords, object.override, true)
                    .pipe(
                        map((result: any) => {
                            // next time perform a modify
                            object.exists = true;
                            this.setStatus(object, true, "Create success");

                            // Associate generated value for auto-key so that next object with auto- can be substituted
                            _.each(autoAttrs, (attr) => {
                                this.autoKeyLogicService.registerAutoKeyValue(attr, this.whoisResourcesService.getAttributes(result));
                            });
                            return result
                        }),
                        catchError((error: any, caught: Observable<any>) => {
                            this.setStatus(object, false, "Create error");
                            const errorDataAttributes = this.whoisResourcesService.getAttributes(error.data);
                            if (!_.isEmpty(errorDataAttributes)) {
                                this.errorReporterService.log("MultiCreate", object.type, this.alertsComponent.getErrors(), errorDataAttributes);
                            }
                            return throwError(error.data);
                        })).toPromise();
            } else {

                return this.restService.modifyObject(source, object.type, object.name, this.whoisResourcesService.turnAttrsIntoWhoisObject(object.attributes), object.passwords, object.override, true)
                    .pipe(
                        map((result: any) => {
                            this.setStatus(object, true, "Modify success");
                            object.showDiff = true;
                            return result;
                        }),
                        catchError((error: any, caught: Observable<any>) => {
                            this.setStatus(object, false, "Modify error");

                            const errorDataAttributes = this.whoisResourcesService.getAttributes(error.data);
                            if (!_.isEmpty(errorDataAttributes)) {
                                this.errorReporterService.log("MultiModify", object.type, this.alertsComponent.getErrors(), errorDataAttributes);
                            }
                            return throwError(error.data);
                        })).toPromise();
            }
        }
    }

    private rewriteRpsl() {
        console.debug("Rewriting RPSL");

        this.objects.rpsl = "";
        _.each(this.objects.objects, (object) => {
            this.objects.rpsl += ("\n" + object.rpsl);
        });
    }

    private setStatus(object: any, isSuccess: boolean, statusMsg: string) {
        object.success = isSuccess;
        object.status = statusMsg;
        if (_.isUndefined(object.success)) {
            object.statusStyle = "text-info";
        } else if (object.success === false) {
            object.statusStyle = "text-error";
        } else if (object.success === true) {
            object.statusStyle = "text-success";
        }
        object.action = this.determineAction(object);
    }

    private getPkey(objectType: string, attributes: any) {
        const objectMeta = this.whoisMetaService.getMetaAttributesOnObjectType(objectType, true);
        const pkeyAttrs = _.filter(objectMeta, (item: any) => {
            return item.primaryKey === true;
        });

        let pkey = "";
        _.each(pkeyAttrs, (pkeyAttr) => {
            const attr = this.whoisResourcesService.getSingleAttributeOnName(attributes, pkeyAttr.name);
            if (!_.isUndefined(attr) && !_.isEmpty(attr.name)) {
                pkey = pkey.concat(_.trim(attr.value));
            }
        });
        return _.trim(pkey);
    }

    private asDisplayLink(source: string, object: any) {
        if (_.isUndefined(object.name)) {
            return undefined;
        }
        return `webupdates/display/${source}/${object.type}/${encodeURIComponent(object.name)}`;
    }

    private asTextUpdatesLink(source: string, object: any) {
        let suffix = "?noRedirect=true";
        if (object.success !== true) {
            suffix = suffix.concat("&rpsl=" + encodeURIComponent(object.rpsl));
        }
        if (object.exists === true) {
            return "textupdates/modify/" + source + "/" + object.type + "/" + object.name + suffix;
        } else {
            return "textupdates/create/" + source + "/" + object.type + suffix;
        }
    }

    private determineAction = (obj: any) => {
        return !_.isUndefined(obj.deleteReason) ? "delete" : obj.exists === true ? "modify" : "create";
    };

    private initializeActionCounter(objects: any) {
        this.actionsPending = objects.length;
        console.debug("initializeActionCounter:" + this.actionsPending);
    }

    private markActionCompleted(object: any, action: any, rewriteRpsl?: boolean) {
        this.actionsPending--;
        console.debug("mark " + this.determineAction(object) + "-" + object.type + "-" + object.name +
            " action completed for " + this.determineAction(object) + ": " + this.actionsPending);
        if (this.actionsPending === 0) {
            if (rewriteRpsl) {
                this.rewriteRpsl();
            }
        }
    }

    private hasValidRpsl() {
        // RPSL contains at least a colon
        return !_.isUndefined(this.objects.rpsl) && this.objects.rpsl.indexOf(":") >= 0;
    }
}
