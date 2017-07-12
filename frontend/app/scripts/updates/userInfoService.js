'use strict';

angular.module('updates')
    .service('UserInfoService', ['$resource', '$q', '$http', '$log', 'LirDataService', '$rootScope', '$cookies',
        function ($resource, $q, $http, $log, lirDataService, $rootScope, $cookies) {

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
                            lirDataService.getOrgs().then(function(result) {
                                _lirs = result;
                                if (_lirs && _lirs.length > 0) {
                                var cookie = $cookies.get('activeMembershipId');
                                var lirMemberId = cookie ? cookie : localStorage.getItem('selectedLir');
                                    if (lirMemberId) {
                                        _selectedLir = _.find(_lirs, function (o) {
                                            return o.memberId === lirMemberId;
                                        });
                                    }
                                    if (!_selectedLir) {
                                        _selectedLir = _lirs[0];
                                    $cookies.put("activeMembershipId",
                                        _selectedLir.memberId,
                                        {path: "/", domain: ".ripe.net", secure: true});
                                    }
                                }

                            localStorage.clear();
                                $rootScope.$broadcast("lirs-loaded-event", result);
                                deferredObject.resolve(_userInfo);
                            });
                        }, function (error) {
                            deferredObject.reject(error);
                        }
                    );

                }
                return deferredObject.promise;
            };

            this.getUsername = function () {
                return _userInfo ? _userInfo.username : undefined;
            };

            this.getDisplayName = function () {
                return _userInfo ? _userInfo.displayName : undefined;
            };

            this.getUuid = function () {
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
                localStorage.setItem('selectedLir', _selectedLir.memberId);
            };


        }]);

