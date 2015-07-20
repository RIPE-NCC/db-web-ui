'use strict';

angular.module('dbWebApp')
    .factory('ModalService', ['$q', '$modal', '$log', function ( $q, $modal, $log ) {
        function ModalService() {

            this.openAddAttributeModal = function ( items ) {
                var deferredObject = $q.defer();

                $log.info('openAddAttributeModal for items ' + JSON.stringify(items));

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
                    $log.info('openAddAttributeModal completed with: ' + JSON.stringify(selectedItem));
                    deferredObject.resolve(selectedItem);
                }, function (reason) {
                    $log.info('openAddAttributeModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

            this.openMd5Modal = function () {
                var deferredObject = $q.defer();

                $log.info('openMd5Modal');

                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalMd5Password.html',
                    controller: 'ModalMd5PasswordController',
                    size: 'lg'
                });

                modalInstance.result.then(function (md5Value) {
                    $log.info('openMd5Modal completed with: ' + JSON.stringify(md5Value));
                    deferredObject.resolve(md5Value);
                }, function (reason) {
                    $log.info('openMd5Modal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

            this.openAuthenticationModal = function (source, mntners) {
                var deferredObject = $q.defer();

                $log.info('openAuthenticationModal start with: ' + source + '  mntners:' +  JSON.stringify(mntners));

                var modalInstance = $modal.open({
                        animation:true,
                        templateUrl: 'scripts/app/webupdates/modalAuthentication.html',
                        controller: 'ModalAuthenticationController',
                        size: 'lg',
                        resolve: {
                            source: function() {
                                return source
                            },
                            mntners: function () {
                                return mntners;
                            }
                        }
                });

                modalInstance.result.then(function (selectedItem) {
                    $log.info('openAuthenticationModal completed with: ' + JSON.stringify(selectedItem));
                    deferredObject.resolve(selectedItem);
                }, function (reason) {
                    $log.info('openAuthenticationModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

        }

        return new ModalService();
    }]);
