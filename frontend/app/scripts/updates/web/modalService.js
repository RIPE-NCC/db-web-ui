'use strict';

angular.module('dbWebApp').factory('ModalService', ['$q', '$uibModal', '$log', function ($q, $modal, $log) {

        var modalService = {};

        modalService.openDomainCreationModal = function (ctrl) {
            //var deferredObject = $q.defer();
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/wizard/domainCreationWaitModal.html',
                controller: ctrl,
                controllerAs: '$ctrl',
                keyboard: false,
                resolve: {
                }
            });
            return modalInstance.result;
        };

        modalService.openChoosePoorRichSyncupdates = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/text/multiDecisionModal.html',
                controller: 'TextMultiDecisionModalController',
                keyboard: false,
                resolve: {}
            });

            return modalInstance.result;
        };

        modalService.openDomainWizardSplash = function (ctrl) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/wizard/domainObjectSplash.html',
                controller: ctrl,
                controllerAs: '$ctrl',
                keyboard: false,
                resolve: {}
            });
            return modalInstance.result;
        };

        modalService.openCreateRoleForAbuseCAttribute = function (source, maintainers, passwords) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/web/modalCreateRoleForAbuseC.html',
                controller: 'ModalCreateRoleForAbuseCController',
                keyboard: false,
                resolve: {
                    source: function () {
                        return source;
                    },
                    maintainers: function () {
                        return maintainers;
                    },
                    passwords: function () {
                        return passwords;
                    }
                }
            });

            return modalInstance.result;
        };

        modalService.openDeleteObjectModal = function (source, objectType, name, onCancel) {
            $log.debug('_openDeleteObjectModal called for ' + objectType + '/' + name);
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/web/modalDeleteObject.html',
                controller: 'ModalDeleteObjectController',
                keyboard: false,
                resolve: {
                    source: function () {
                        return source;
                    },
                    objectType: function () {
                        return objectType;
                    },
                    name: function () {
                        return name;
                    },
                    onCancel: function () {
                        return onCancel;
                    }
                }
            });

            return modalInstance.result;
        };

        modalService.openAddAttributeModal = function (items) {
            var deferredObject = $q.defer();

            $log.debug('openAddAttributeModal for items', items);

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/web/modalAddAttribute.html',
                controller: 'ModalAddAttributeController',
                size: 'lg',
                keyboard: false,
                resolve: {
                    items: function () {
                        return items;
                    }
                }
            });

            modalInstance.result.then(
                function (selectedItem) {
                    $log.debug('openAddAttributeModal completed with:', selectedItem);
                    deferredObject.resolve(selectedItem);
                }, function (reason) {
                    $log.debug('openAddAttributeModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

            return deferredObject.promise;
        };

        modalService.openMd5Modal = function () {
            var deferredObject = $q.defer();

            $log.debug('openMd5Modal');

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/web/modalMd5Password.html',
                controller: 'ModalMd5PasswordController',
                size: 'lg',
                keyboard: false
            });

            modalInstance.result.then(function (md5Value) {
                $log.debug('openMd5Modal completed with:', md5Value);
                deferredObject.resolve(md5Value);
            }, function (reason) {
                $log.debug('openMd5Modal cancelled because: ' + reason);
                deferredObject.reject(reason);
            });

            return deferredObject.promise;
        };

        /**
         *
         * @param method Only used when method === 'ForceDelete'
         * @param object
         * @param mntners
         * @param mntnersWithoutPassword
         * @param allowForcedDelete
         * @param isLirObject
         * @returns {Function} A Promise
         */
        modalService.openAuthenticationModal = function (method, object, mntners, mntnersWithoutPassword, allowForcedDelete, isLirObject) {
            var deferredObject = $q.defer();

            $log.debug('openAuthenticationModal start for method: ' + method + ' and ' + object.source + '  mntners:' + angular.toJson(mntners), 'isLirObject', isLirObject);

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'scripts/updates/web/modalAuthentication.html',
                controller: 'ModalAuthenticationController',
                keyboard: false,
                resolve: {
                    method: function () {
                        return method;
                    },
                    source: function () {
                        return object.source;
                    },
                    objectType: function () {
                        return object.type;
                    },
                    objectName: function () {
                        return object.name;
                    },
                    mntners: function () {
                        return mntners;
                    },
                    mntnersWithoutPassword: function () {
                        return mntnersWithoutPassword;
                    },
                    allowForcedDelete: function () {
                        return !!allowForcedDelete;
                    },
                    isLirObject: function () {
                        return !!isLirObject;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $log.debug('openAuthenticationModal completed with:', result);
                deferredObject.resolve(result);
            }, function (reason) {
                $log.debug('openAuthenticationModal cancelled because:', reason);
                deferredObject.reject(reason);
            });

            return deferredObject.promise;
        };

        return modalService;
    }]
);
