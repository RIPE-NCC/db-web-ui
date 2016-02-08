// jshint ignore: start
/*global window: false */

'use strict';

angular.module('dbWebApp')
    .controller('UserInfoController', ['$scope', '$log', 'UserInfoService', 'LOGIN_URL',
        function ($scope, $log, UserInfoService, loginUrl) {

            function _initialize() {
                $log.debug('Using login-url:' +  loginUrl);
                UserInfoService.getUserInfo().then(
                    function(result) {
                        $log.debug('Ppupulate upper right with: ' + JSON.stringify(result));
                        RIPE.username = result.displayName;
                        RIPE.usermenu = {
                            'User details': [['Profile', loginUrl + '/profile'], ['Logout', loginUrl + '/logout']]
                        };
                        RIPE.userimg =  loginUrl + '/picture/' + result.uuid;
                        init_user_menu();
                        display_user_menu();
                    }
                );
            }
            _initialize();

        }
]);
