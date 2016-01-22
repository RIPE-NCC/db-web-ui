'use strict';

angular.module('dbWebApp')
    .factory('ModalService', ['$q', '$modal', '$log', function ( $q, $modal, $log ) {
        function ModalService() {

            this.openCreateRoleForAbuseCAttribute = function(source, maintainers, passwords) {
                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalCreateRoleForAbuseC.html',
                    controller: 'ModalCreateRoleForAbuseCController',
                    keyboard:false,
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

            this.openDeleteObjectModal = function(source, objectType, name, onCancel) {
                $log.debug("_openDeleteObjectModal called for " + objectType + '/'+ name);
                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalDeleteObject.html',
                    controller: 'ModalDeleteObjectController',
                    keyboard:false,
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

            this.openAddAttributeModal = function ( items ) {
                var deferredObject = $q.defer();

                $log.debug('openAddAttributeModal for items ' + JSON.stringify(items));

                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalAddAttribute.html',
                    controller: 'ModalAddAttributeController',
                    size: 'lg',
                    keyboard:false,
                    resolve: {
                        items: function () {
                            return items;
                        }
                    }
                });

                modalInstance.result.then(
                    function (selectedItem) {
                        $log.debug('openAddAttributeModal completed with: ' + JSON.stringify(selectedItem));
                        deferredObject.resolve(selectedItem);
                    }, function (reason) {
                        $log.debug('openAddAttributeModal cancelled because: ' + reason);
                        deferredObject.reject(reason);
                    });

                return deferredObject.promise;
            };

            this.openMd5Modal = function () {
                var deferredObject = $q.defer();

                $log.debug('openMd5Modal');

                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalMd5Password.html',
                    controller: 'ModalMd5PasswordController',
                    size: 'lg',
                    keyboard:false,
                });

                modalInstance.result.then(function (md5Value) {
                    $log.debug('openMd5Modal completed with: ' + JSON.stringify(md5Value));
                    deferredObject.resolve(md5Value);
                }, function (reason) {
                    $log.debug('openMd5Modal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

            this.openAuthenticationModal = function (method, source, objectType, objectName, mntners, mntnersWithoutPassword) {
                var deferredObject = $q.defer();

                $log.debug('openAuthenticationModal start for method: '+ method + ' and ' + source + '  mntners:' +  JSON.stringify(mntners));

                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalAuthentication.html',
                    controller: 'ModalAuthenticationController',
                    keyboard:false,
                    resolve: {
                            method: function() {
                                return method;
                            },
                            source: function () {
                                return source;
                            },
                            objectType: function () {
                                return objectType;
                            },
                            objectName: function () {
                                return objectName;
                            },
                            mntners: function () {
                                return mntners;
                            },
                            mntnersWithoutPassword: function () {
                                return mntnersWithoutPassword;
                            }
                        }
                });

                modalInstance.result.then(function (result) {
                    $log.debug('openAuthenticationModal completed with: ' + JSON.stringify(result));
                    deferredObject.resolve(result);
                }, function (reason) {
                    $log.debug('openAuthenticationModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

        }

        return new ModalService();
    }]);
