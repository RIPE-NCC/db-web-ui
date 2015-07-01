'use strict';

angular.module('dbWebApp')
    .factory( 'UserInfoService', ['$resource',
        function($resource) {

        var _userInfo = undefined;

        return {
            init: function(callback) {
                $resource('api/user/info').get(function(data) {
                    _userInfo = data;
                    if (typeof callback == "function"){
                        callback();
                    }
                });
            },
            getUsername: function() { return _userInfo.username; },
            getDisplayName: function() { return _userInfo.displayName; },
            getUuid: function() { return _userInfo.uuid; }
        };
    }
]);
