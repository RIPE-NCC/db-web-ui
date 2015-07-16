'use strict';

angular.module('dbWebApp')
    .factory('ModalService', ['$q', '$modal', function ( $q, $modal ) {
        function ModalService() {

            this.openAddAttributeModal = function ( items ) {
                var deferredObject = $q.defer();

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
                    console.log('openAddAttributeModal completed with: ' + JSON.stringify(selectedItem));
                    deferredObject.resolve(selectedItem);
                }, function (reason) {
                    console.log('openAddAttributeModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

            this.openMd5Modal = function () {
                var deferredObject = $q.defer();

                var modalInstance = $modal.open({
                    animation:true,
                    templateUrl: 'scripts/app/webupdates/modalMd5Password.html',
                    controller: 'ModalMd5PasswordController',
                    size: 'lg'
                });

                modalInstance.result.then(function (md5Value) {
                    console.log('openMd5Modal completed with: ' + JSON.stringify(md5Value));
                    deferredObject.resolve(md5Value);
                }, function (reason) {
                    console.log('openMd5Modal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

            this.openAuthenticationModal = function (source, mntners) {
                var deferredObject = $q.defer();

                console.log('openAuthenticationModal start with: ' + source + '  mntners:' +  JSON.stringify(mntners));

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
                    console.log('openAuthenticationModal completed with: ' + JSON.stringify(selectedItem));
                    deferredObject.resolve(selectedItem);
                }, function (reason) {
                    console.log('openAuthenticationModal cancelled because: ' + reason);
                    deferredObject.reject(reason);
                });

                return deferredObject.promise;
            };

        }

        return new ModalService();
    }]);
