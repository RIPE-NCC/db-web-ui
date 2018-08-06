class ModalService {

    public static $inject = ["$q", "$uibModal", "$log"];

    constructor(public $q: ng.IQService,
                public $modal: any,
                public $log: angular.ILogService) {
    }

    public openDomainCreationModal(ctrl: any) { // FIXME probably Function
        return this.$modal.open({
            animation: false,
            controller: ctrl,
            controllerAs: "$ctrl",
            keyboard: false,
            resolve: {},
            templateUrl: "scripts/wizard/domainCreationWaitModal.html",
        }).result;
    }

    public openChoosePoorRichSyncupdates() {
        return this.$modal.open({
            animation: false,
            controller: "TextMultiDecisionModalController",
            keyboard: false,
            resolve: {},
            templateUrl: "scripts/updates/text/multiDecisionModal.html",
        }).result;
    }

    public openDomainWizardSplash(ctrl: any) {
        return this.$modal.open({
            animation: false,
            backdrop: "static",
            controller: ctrl,
            controllerAs: "$ctrl",
            keyboard: false,
            resolve: {},
            templateUrl: "scripts/wizard/domainObjectSplash.html",
        }).result;
    }

    public openCreateRoleForAbuseCAttribute(source: string, maintainers: any, passwords: string) {
        return this.$modal.open({
            animation: false,
            controller: "ModalCreateRoleForAbuseCController",
            controllerAs: "$ctrl",
            keyboard: false,
            resolve: {
                maintainers() {
                    return maintainers;
                },
                passwords() {
                    return passwords;
                },
                source() {
                    return source;
                },
            },
            templateUrl: "scripts/updates/web/modalCreateRoleForAbuseC.html",
        }).result;
    }

    public openDeleteObjectModal(source: string, objectType: string, name: string, onCancel: any) {
        this.$log.debug("_openDeleteObjectModal called for " + objectType + "/" + name);
        const modalInstance = this.$modal.open({
            animation: false,
            component: "modalDeleteObject",
            keyboard: false,
            resolve: {
                name() {
                    return name;
                },
                objectType() {
                    return objectType;
                },
                onCancel() {
                    return onCancel;
                },
                source() {
                    return source;
                },
            },
        });
        return modalInstance.result;
    }

    public openAddAttributeModal(items: any) {
        const deferredObject = this.$q.defer();

        this.$log.debug("openAddAttributeModal for items", items);

        this.$modal.open({
            animation: false,
            component: "modalAddAttribute",
            keyboard: false,
            resolve: {
                items() {
                    return items;
                },
            },
            size: "lg",
        }).result
            .then((selectedItem: any) => {
                this.$log.debug("openAddAttributeModal completed with:", selectedItem);
                deferredObject.resolve(selectedItem);
            }, (reason: any) => {
                this.$log.debug("openAddAttributeModal cancelled because: " + reason);
                deferredObject.reject(reason);
            });

        return deferredObject.promise;
    }

    public openMd5Modal() {
        const deferredObject = this.$q.defer();

        this.$log.debug("openMd5Modal");

        const modalInstance = this.$modal.open({
            animation: false,
            component: "modalMd5Password",
            keyboard: false,
            size: "lg",
        });

        modalInstance.result
            .then((md5Value: any) => {
                this.$log.debug("openMd5Modal completed with:", md5Value);
                deferredObject.resolve(md5Value);
            }, (reason: any) => {
                this.$log.debug("openMd5Modal cancelled because: " + reason);
                deferredObject.reject(reason);
            });

        return deferredObject.promise;
    }

    /**
     *
     * @param method Only used when method === "ForceDelete"
     * @param object
     * @param mntners
     * @param mntnersWithoutPassword
     * @param allowForcedDelete
     * @param isLirObject
     * @returns {Function} A Promise
     */
    public openAuthenticationModal(method: any, object: any, mntners: any, mntnersWithoutPassword: any, allowForcedDelete: boolean, isLirObject: any) {
        const deferredObject = this.$q.defer();

        this.$log.debug("openAuthenticationModal start for method: " + method + " and " + object.source + "  mntners:" + angular.toJson(mntners), "isLirObject", isLirObject);

        this.$modal.open({
            animation: false,
            component: "modalAuthentication",
            keyboard: false,
            resolve: {
                    method() {
                        return method;
                    },
                    source() {
                        return object.source;
                    },
                    objectType() {
                        return object.type;
                    },
                    objectName() {
                        return object.name;
                    },
                    mntners() {
                        return mntners;
                    },
                    mntnersWithoutPassword() {
                        return mntnersWithoutPassword;
                    },
                    allowForcedDelete() {
                        return !!allowForcedDelete;
                    },
                    isLirObject() {
                        return !!isLirObject;
                    },
                },
        }).result
            .then((result: any) => {
                this.$log.debug("openAuthenticationModal completed with:", result);
                deferredObject.resolve(result);
            }, (reason: any) => {
                this.$log.debug("openAuthenticationModal cancelled because:", reason);
                deferredObject.reject(reason);
            });

        return deferredObject.promise;
    }
}

angular.module("dbWebApp").service("ModalService", ModalService);
