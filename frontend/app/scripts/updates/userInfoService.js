'use strict';

angular.module('updates')
    .service('UserInfoService', ['$resource', '$q', '$http', '$log',
        function ($resource, $q, $http, $log) {

            var _userInfo;

            this.getUserInfo = function () {
                var deferredObject = $q.defer();

                if(!_.isUndefined(_userInfo)) {
                    deferredObject.resolve(_userInfo);
                } else {
                    $resource('api/user/info').get().$promise.then(
                        function (result) {
                            _userInfo = result;
                            deferredObject.resolve(result);
                        }, function (error) {
                            deferredObject.reject(error);
                        }
                    );
                }

                return deferredObject.promise;
            };

            this.getUsername = function () {
                //$log.info('getUsername:' + _userInfo);
                return _userInfo ? _userInfo.username : undefined;
            };

            this.getDisplayName = function () {
               //$log.info('getDisplayName:' + _userInfo);
                return _userInfo ? _userInfo.displayName : undefined;
            };

            this.getUuid = function () {
                //$log.info('getUuid:' + _userInfo);
                return _userInfo ? _userInfo.uuid : undefined;
            };

            this.clear = function() {
                _userInfo = undefined;
            };

        }]);

