class TextCommonsService {
    public static $inject = ["$state", "$log", "$q", "WhoisResources", "CredentialsService", "AlertService",
        "MntnerService", "ModalService", "ObjectUtilService"];

    constructor(private $state: ng.ui.IStateService,
                private $log: angular.ILogService,
                private $q: ng.IQService,
                private WhoisResources: any,
                private CredentialsService: CredentialsService,
                private AlertService: AlertService,
                private MntnerService: MntnerService,
                private ModalService: ModalService,
                private ObjectUtilService: ObjectUtilService) {
    }
    // TODO CHANGE ANY INTO IAttributeModel[]
    public enrichWithDefaults(objectSource: string, objectType: string, attributes: any) {
        // This does only add value if attribute exist
        attributes.setSingleAttributeOnName("source", objectSource);
        attributes.setSingleAttributeOnName("nic-hdl", "AUTO-1");
        attributes.setSingleAttributeOnName("organisation", "AUTO-1");
        attributes.setSingleAttributeOnName("org-type", "OTHER"); // other org-types only settable with override

        // Remove unneeded optional attrs
        attributes.removeAttributeWithName("created");
        attributes.removeAttributeWithName("last-modified");
        attributes.removeAttributeWithName("changed");
    }

    public validate(objectType: string, attributes: IAttributeModel[], errors?: any) {
        const unknownAttrs = _.filter(attributes, (attr) => {
            return _.isUndefined(this.WhoisResources.findMetaAttributeOnObjectTypeAndName(objectType, attr.name));
        });
        if (!_.isEmpty(unknownAttrs)) {
            _.each(unknownAttrs, (attr) => {
                const msg = attr.name + ": Unknown attribute";
                if (_.isUndefined(errors)) {
                    this.AlertService.addGlobalError(msg);
                } else {
                    errors.push({plainText: msg});
                }
            });
            return;
        }

        let errorCount = 0;
        const mandatoryAtrs = this.WhoisResources._getMetaAttributesOnObjectType(objectType, true);
        _.each(mandatoryAtrs, (meta) => {
            if (_.any(attributes, (attr) => {
                return attr.name === meta.name;
            }) === false) {
                const msg = meta.name + ": Missing mandatory attribute";
                if (_.isUndefined(errors)) {
                    this.AlertService.addGlobalError(msg);
                } else {
                    errors.push({plainText: msg});
                }
                errorCount++;
            }
        });

        const enrichedAttributes = this.WhoisResources.wrapAndEnrichAttributes(objectType, attributes);
        if (!enrichedAttributes.validate()) {
            _.each(enrichedAttributes, (item) => {
                if (item.$$error) {
                    // Note: keep it lower-case to be consistent with server-side error reports
                    const msg = item.name + ": " + item.$$error;
                    if (_.isUndefined(errors)) {
                        this.AlertService.addGlobalError(msg);
                    } else {
                        errors.push({plainText: msg});
                    }
                }
            });
            errorCount++;
        }
        return errorCount === 0;
    }

    public authenticate(method: string, objectSource: string, objectType: string, objectName: string,
                        ssoMaintainers: any, attributes: any, passwords: string[], override: string) {
        const deferredObject = this.$q.defer();
        let needsAuth = false;

        if (!_.isUndefined(override)) {
            // prefer override over passwords
            if (angular.isArray(passwords)) {
                passwords.length = 0; // length is writable in JS :)
            }
        } else {
            if (_.isEmpty(passwords) && _.isUndefined(override)) {
                // show password popup if needed
                const objectMntners = this._getObjectMntners(attributes);
                if (this.MntnerService.needsPasswordAuthentication(ssoMaintainers, [], objectMntners)) {
                    needsAuth = true;
                    this._performAuthentication(method, objectSource, objectType, objectName, ssoMaintainers, objectMntners, this.ObjectUtilService.isLirObject(attributes)).then(
                        () => {
                            this.$log.debug("Authentication succeeded");
                            deferredObject.resolve(true);
                        }, () => {
                            this.$log.debug("Authentication failed");
                            deferredObject.reject(false);
                        },
                    );
                }
            }
        }
        if (needsAuth === false) {
            this.$log.debug("No authentication needed");
            deferredObject.resolve(true);
        }
        return deferredObject.promise;
    }

    public stripEmptyAttributes(attributes: any) {
        return attributes.removeNullAttributes();
    }

    public navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: string) {
        this.$state.transitionTo("webupdates.display", {
            method: operation,
            name: objectName,
            objectType,
            source,
        });
    }

    public navigateToDelete(objectSource: string, objectType: string, objectName: string, onCancel: any) {
        this.$state.transitionTo("webupdates.delete", {
            name: objectName,
            objectType,
            onCancel,
            source: objectSource,
        });
    }

    public uncapitalize(attributes: IAttributeModel[]) {
        return this.WhoisResources.wrapAttributes(
            _.map(attributes, (attr) => {
                attr.name = attr.name.toLowerCase();
                return attr;
            }),
        );
    }

    public capitaliseMandatory(attributes: IAttributeModel[]) {
        _.each(attributes, (attr) => {
            if (!_.isUndefined(attr.$$meta) && attr.$$meta.$$mandatory) {
                attr.name = attr.name.toUpperCase();
            }
        });
    }

    public getPasswordsForRestCall(objectType: string) {
        const passwords = [];

        if (this.CredentialsService.hasCredentials()) {
            passwords.push(this.CredentialsService.getCredentials().successfulPassword);
        }

        return passwords;
    }

    private _performAuthentication(method: string, objectSource: string, objectType: string, objectName: string,
                                   ssoMntners: IMntByModel[], objectMntners: any[], isLirObject: boolean) {

        const object = {
            name: objectName,
            source: objectSource,
            type: objectType,
        };
        const deferredObject = this.$q.defer();
        const mntnersWithPasswords = this.MntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
        const mntnersWithoutPasswords = this.MntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
        const allowForcedDelete = !_.find(objectMntners, (o) => {
            return this.MntnerService.isNccMntner(o.key);
        });
        this.ModalService.openAuthenticationModal(method, object, mntnersWithPasswords, mntnersWithoutPasswords, allowForcedDelete, isLirObject).then(
            (result: any) => {
                this.AlertService.clearErrors();
                const authenticatedMntner = result.selectedItem;
                if (this._isMine(authenticatedMntner)) {
                    // has been successfully associated in authentication modal
                    ssoMntners.push(authenticatedMntner);
                }
                deferredObject.resolve(true);
            }, () => {
                deferredObject.reject(false);
            },
        );
        return deferredObject.promise;
    }

    private _isMine(mntner: IMntByModel) {
        if (!mntner.mine) {
            return false;
        } else {
            return mntner.mine;
        }
    }

    // TODO REPLACE ANY
    private _getObjectMntners(attributes: any) {
        return _.map(attributes.getAllAttributesWithValueOnName("mnt-by"), (objMntner: any) => {
            // Notes:
            // - RPSL attribute values can contain leading and trailing spaces, so the must be trimmed
            // - Assume maintainers have md5-password, so prevent unmodifyable error
            return {type: "mntner", key: _.trim(objMntner.value), auth: ["MD5-PW"]};
        });
    }
}
angular.module("textUpdates").service("TextCommonsService", TextCommonsService);
