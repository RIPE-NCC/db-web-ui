'use strict';

angular.module('updates')
    .service('UserInfoService', ['$resource', '$q', '$http', '$log',
        function ($resource, $q, $http, $log) {

            var _userInfo;

            this.getUserInfo = function () {
                var deferredObject = $q.defer();

                if(!_.isUndefined(_userInfo)) {
                    $log.debug('getUserInfo cached:' + JSON.stringify(_userInfo));
                    deferredObject.resolve(_userInfo);
                } else {
                    $log.debug('getUserInfo start');

                    $resource('api/user/info').get().$promise.then(
                        function (result) {
                            _userInfo = result;
                            $log.debug('getUserInfo success:' + JSON.stringify(result));
                            deferredObject.resolve(result);
                        }, function (error) {
                            $log.error('getUserInfo error:' + JSON.stringify(error));
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

