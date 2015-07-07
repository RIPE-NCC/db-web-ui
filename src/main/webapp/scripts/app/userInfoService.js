'use strict';

angular.module('dbWebApp')
    .factory( 'UserInfoService', ['$resource',
        function($resource) {

        var _userInfo = undefined;

        return {
            init: function(callback) {
                if (typeof _userInfo != 'undefined') {
                    if (typeof callback == "function"){
                        callback();
                    }
                } else {
                    $resource('api/user/info').get(function(data) {
                        _userInfo = data;
                        if (typeof callback == "function"){
                            callback();
                        }
                    });
                }
            },
            getUsername: function() {
                return _userInfo ? _userInfo.username : undefined;
            },
            getDisplayName: function() {
                return _userInfo ? _userInfo.displayName : undefined;
            },
            getUuid: function() {
                return _userInfo ? _userInfo.uuid : undefined;
            }
        };
    }
]);
