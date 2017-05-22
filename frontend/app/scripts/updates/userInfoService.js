'use strict';

angular.module('updates')
    .service('UserInfoService', ['$resource', '$q', '$http', '$log', 'LirDataService', '$rootScope',
        function ($resource, $q, $http, $log, lirDataService, $rootScope) {

            var _userInfo;
            var _lirs;
            var _selectedLir;

            this.getUserInfo = function () {
                var deferredObject = $q.defer();

                if(!_.isUndefined(_userInfo)) {
                    deferredObject.resolve(_userInfo);
                } else {
                    $resource('api/user/info').get().$promise.then(
                        function (result) {
                            _userInfo = result;
                            deferredObject.resolve(result);

                            lirDataService.getOrgs().then(function(result) {
                                _lirs = result;

                                if (_lirs && _lirs.length > 0) {
                                    _selectedLir = _lirs[0];
                                }

                                $rootScope.$broadcast("lirs-loaded-event", result);
                            });
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

            this.getLirs = function() {
                return _lirs;
            };

            this.getSelectedLir = function() {
                return _selectedLir;
            };

            this.setSelectedLir = function(lir) {
                _selectedLir = lir;
            };
        }]);

