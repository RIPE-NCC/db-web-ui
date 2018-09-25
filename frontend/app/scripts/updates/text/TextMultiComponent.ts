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

class TextMultiController {

    public static $inject = ["$stateParams", "$state", "$resource", "$log", "$q", "$window",
        "WhoisResources", "RestService", "AlertService", "ErrorReporterService",
        "RpslService", "TextCommonsService", "SerialExecutorService", "AutoKeyLogicService", "Properties", "PreferenceService"];

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

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public $resource: any,
                public $log: angular.ILogService,
                public $q: ng.IQService,
                public $window: any,
                public WhoisResources: any,
                public RestService: RestService,
                public AlertService: AlertService,
                public ErrorReporterService: ErrorReporterService,
                public RpslService: RpslService,
                public TextCommonsService: TextCommonsService,
                public SerialExecutorService: SerialExecutorService,
                public AutoKeyLogicService: AutoKeyLogicService,
                public Properties: any,
                public PreferenceService: PreferenceService) {
        this.initialisePage();
    }

    public initialisePage() {
        this.actionsPending = 0;

        this.AlertService.clearErrors();

        // extract parameters from the url
        this.objects.source = this.Properties.SOURCE;
        this.objects.rpsl = "";

        this.$log.debug("TextMultiController: Url params:" +
            " object.source:" + this.objects.source);

        // start in text-mode
        this.setTextMode();
    }

    public setWebMode() {
        this.AlertService.clearErrors();

        this.$log.info("TextMultiController.setWebMode: source" + this.objects.source + ", rpsl:" + this.objects.rpsl);

        if (!this.hasValidRpsl()) {
            this.AlertService.setGlobalError("No valid RPSL found");
            return;
        }

        const parsedObjs = this.RpslService.fromRpsl(this.objects.rpsl);
        if (parsedObjs.length === 0) {
            this.AlertService.setGlobalError("No valid RPSL object(s) found");
            return;
        }

        this.$log.debug("parsed rpsl:" + JSON.stringify(parsedObjs));
        this.textMode = false;
        this.objects.objects = this.verify(this.objects.source, this.objects.rpsl, parsedObjs);
    }

    public isWebMode() {
        return this.textMode === false;
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
        this.initialisePage();
    }

    public onRpslTyped() {
        this.$log.debug("Typed RPSL:" + this.objects.rpsl);
    }

    public useOld() {
        this.PreferenceService.setPoorSyncupdatesMode();
        this.$window.location.href = this.Properties.DATABASE_SYNCUPDATES_URL;
    }

    public submit() {
        this.AlertService.clearErrors();

        this.$log.debug("submit:" + JSON.stringify(this.objects.objects));

        this.initializeActionCounter(this.objects.objects);

        // Execute any by one so that AUT0-keys can be resolved
        this.SerialExecutorService.execute(this.objects.objects, this.submitSingle);
    }

    private submitSingle = (object: any) => {
        const deferredObject = this.$q.defer();

        if (object.success === true) {
            deferredObject.resolve(object);
            this.markActionCompleted(object, this.determineAction(object) + " already performed");
        } else {
            this.setStatus(object, undefined, "Start " + this.determineAction(object));
            this.performAction(this.objects.source, object)
                .then((whoisResources: any) => {
                        object.name = whoisResources.getPrimaryKey();
                        object.attributes = whoisResources.getAttributes();
                        const obj = {
                            attributes: object.attributes,
                            deleteReason: object.deleteReason,
                            override: object.override,
                            passwords: object.passwords,
                        };
                        object.rpsl = this.RpslService.toRpsl(obj);
                        if (object.deleted !== true) {
                            object.displayUrl = this.asDisplayLink(this.objects.source, object);
                        }
                        object.textupdatesUrl = undefined;
                        object.errors = [];
                        object.warnings = whoisResources.getAllWarnings();
                        object.infos = whoisResources.getAllInfos();

                        this.markActionCompleted(object, this.determineAction(object) + " success", true);

                        deferredObject.resolve(object);
                    }, (whoisResources: any) => {
                        if (!_.isUndefined(whoisResources)) {
                            object.errors = whoisResources.getAllErrors();
                            object.warnings = whoisResources.getAllWarnings();
                            object.infos = whoisResources.getAllInfos();
                        }

                        this.markActionCompleted(object, this.determineAction(object) + " failed", true);

                        deferredObject.reject(object);
                    },
                );
        }

        return deferredObject.promise;
    }

    private verify(source: string, rpsl: any, parsedObjs: any) {
        const objects: ITextMultiObject[] = [];
        this.AutoKeyLogicService.clear();
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

            const attrs = this.TextCommonsService.uncapitalize(parsedObj.attributes);

            // assume nam of first attribute is type indicator
            object.type = this.determineObjectType(attrs);

            // back to rpsl
            object.rpsl = this.RpslService.toRpsl(parsedObj);

            this.$log.info("object:" + JSON.stringify(object));

            // validate
            if (!this.TextCommonsService.validate(object.type, attrs, object.errors)) {
                this.$log.info("validation error:" + JSON.stringify(object.errors));
                this.setStatus(object, false, "Invalid syntax");
                this.markActionCompleted(object, "syntax error");
            } else {
                // determine primary key pf object
                object.attributes = this.WhoisResources.wrapAndEnrichAttributes(object.type, attrs);
                object.name = this.getPkey(object.type, object.attributes);

                // find out if this object has AUTO-keys
                this.AutoKeyLogicService.identifyAutoKeys(object.type, attrs);

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
                    },
                );
            }
        });
        return objects;
    }

    private determineObjectType(attributes: any) {
        return attributes[0].name;
    }

    private doesExist(source: string, object: ITextMultiObject, passwords: string) {
        const deferredObject = this.$q.defer();

        if (_.isUndefined(object.name) || _.isEmpty(object.name) || _.startsWith(_.trim(object.name), "AUTO-")) {
            this.$log.info("Need need to perform fetch to check if exists");
            deferredObject.resolve(false);
        } else {
            this.$log.info("Perform fetch to check if exists");
            // TODO fetch with override
            this.RestService.fetchObject(source, object.type, object.name, passwords, true)
                .then((result: any) => {
                    this.$log.debug("Successfully fetched object " + object.name);
                    // store original value to make diff-view later
                    object.rpslOriginal = this.RpslService.toRpsl({attributes: result.getAttributes()});
                    deferredObject.resolve(true);
                }, (error: any) => {
                    this.$log.debug("Error fetching object " + object.name + ", http-status:" + error.status);
                    object.rpslOriginal = undefined;
                    if (error.status === 404) {
                        deferredObject.resolve(false);
                    } else {
                        deferredObject.reject(error.data.getAllErrors());
                    }
                },
            );
        }
        return deferredObject.promise;
    }

    private performAction(source: string, object: any) {
        const deferredObject = this.$q.defer();

        if (object.errors.length > 0) {
            this.$log.debug("Skip performing action " + this.determineAction(object) + "-" + object.type + "-" + object.name + " since has errors");
            deferredObject.reject(undefined);
        } else {
            this.$log.debug("Start performing action " + this.determineAction(object) + "-" + object.type + "-" + object.name);

            // replace auto-key with real generated key
            this.AutoKeyLogicService.substituteAutoKeys(object.attributes);

            // find attrs with an auto key
            const autoAttrs = this.AutoKeyLogicService.getAutoKeys(object.attributes);

            // might have changed due to auto-key
            const oldName = _.trim(object.name);
            object.name = _.trim(this.getPkey(object.type, object.attributes));
            if (_.startsWith(oldName, "AUTO-") && !_.startsWith(object.name, "AUTO-")) {
                object.exists = true;
            }

            if (!_.isUndefined(object.deleteReason)) {
                // TODO: add support for delete override

                this.RestService.deleteObject(source, object.type, object.name, object.deleteReason, false,
                    object.passwords, false)
                    .then((result: any) => {
                        object.deleted = true;
                        object.exists = false;
                        this.setStatus(object, true, "Delete success");

                        deferredObject.resolve(result);
                    }, (error: any) => {
                        this.setStatus(object, false, "Delete error");

                        if (!_.isEmpty(error.data.getAttributes())) {
                            this.ErrorReporterService.log("MultiDelete", object.type, this.AlertService.getErrors(), error.data.getAttributes());
                        }
                        deferredObject.reject(error.data);
                    },
                );
            } else if (object.exists === false) {

                this.RestService.createObject(source, object.type,
                    this.WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                    object.passwords, object.override, true)
                    .then((result: any) => {

                        // next time perform a modify
                        object.exists = true;
                        this.setStatus(object, true, "Create success");

                        // Associate generated value for auto-key so that next object with auto- can be substituted
                        _.each(autoAttrs, (attr) => {
                            this.AutoKeyLogicService.registerAutoKeyValue(attr, result.getAttributes());
                        });
                        deferredObject.resolve(result);
                    }, (error: any) => {
                        this.setStatus(object, false, "Create error");

                        if (!_.isEmpty(error.data.getAttributes())) {
                            this.ErrorReporterService.log("MultiCreate", object.type, this.AlertService.getErrors(), error.data.getAttributes());
                        }
                        deferredObject.reject(error.data);
                    },
                );

            } else {
                this.RestService.modifyObject(source, object.type, object.name,
                    this.WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                    object.passwords, object.override, true)
                    .then((result) => {
                        this.setStatus(object, true, "Modify success");
                        object.showDiff = true;

                        deferredObject.resolve(result);
                    }, (error) => {
                        this.setStatus(object, false, "Modify error");

                        if (!_.isEmpty(error.data.getAttributes())) {
                            this.ErrorReporterService.log("MultiModify", object.type, this.AlertService.getErrors(), error.data.getAttributes());
                        }
                        deferredObject.reject(error.data);
                    },
                );
            }
        }
        return deferredObject.promise;
    }

    private rewriteRpsl() {
        this.$log.debug("Rewriting RPSL");

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
        const objectMeta = this.WhoisResources._getMetaAttributesOnObjectType(objectType, true);
        const pkeyAttrs = _.filter(objectMeta, (item: any) => {
            return item.primaryKey === true;
        });

        let pkey = "";
        _.each(pkeyAttrs, (pkeyAttr) => {
            const attr = attributes.getSingleAttributeOnName(pkeyAttr.name);
            if (!_.isUndefined(attr) && !_.isEmpty(attr.name)) {
                pkey = pkey.concat(attr.value);
            }
        });
        return _.trim(pkey);
    }

    private asDisplayLink(source: string, object: any) {
        if (_.isUndefined(object.name)) {
            return undefined;
        }
        return "#/webupdates/display/" + source + "/" + object.type + "/" + object.name;
    }

    private asTextUpdatesLink(source: string, object: any) {
        let suffix = "?noRedirect=true";
        if (object.success !== true) {
            suffix = suffix.concat("&rpsl=" + encodeURIComponent(object.rpsl));
        }
        if (object.exists === true) {
            return "#/textupdates/modify/" + source + "/" + object.type + "/" + object.name + suffix;
        } else {
            return "#/textupdates/create/" + source + "/" + object.type + suffix;
        }
    }

    private determineAction(obj: any) {
        return !_.isUndefined(obj.deleteReason) ? "delete" : obj.exists === true ? "modify" : "create";
    }

    private initializeActionCounter(objects: any) {
        this.actionsPending = objects.length;
        this.$log.debug("initializeActionCounter:" + this.actionsPending);
    }

    private markActionCompleted(object: any, action: any, rewriteRpsl: boolean = false) {
        this.actionsPending--;
        this.$log.debug("mark " + this.determineAction(object) + "-" + object.type + "-" + object.name +
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

angular.module("textUpdates")
    .component("textMulti", {
        controller: TextMultiController,
        templateUrl: "scripts/updates/text/multi.html",
    });
