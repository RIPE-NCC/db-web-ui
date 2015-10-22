'use strict';

angular.module('dbWebApp')
    .factory('ModalService', ['$q', '$modal', '$log', function ( $q, $modal, $log ) {
        function ModalService() {

            this.openDeleteObjectModal = function(source, objectType, name) {
                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalDeleteObject.html',
                    controller: 'ModalDeleteObjectController',
                    resolve: {
                        source: function () {
                            return source;
                        },
                        objectType: function () {
                            return objectType;
                        },
                        name: function () {
                            return name;
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
                    resolve: {
                        items: function () {
                            return items;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
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
                    size: 'lg'
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

            this.openAuthenticationModal = function (source, mntners) {
                var deferredObject = $q.defer();

                $log.debug('openAuthenticationModal start with: ' + source + '  mntners:' +  JSON.stringify(mntners));

                var modalInstance = $modal.open({
                        animation:true,
                        templateUrl: 'scripts/app/webupdates/modalAuthentication.html',
                        controller: 'ModalAuthenticationController',
                        size: 'lg',
                        resolve: {
                            source: function() {
                                return source;
                            },
                            mntners: function () {
                                return mntners;
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