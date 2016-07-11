/*global angular, display_user_menu, init_user_menu, RIPE */
(function () {
    'use strict';

    angular.module('loginStatus').controller('UserInfoController', ['$scope', '$log', 'UserInfoService', 'LOGIN_URL',

        function ($scope, $log, UserInfoService, loginUrl) {

            function _initialize() {
                $log.debug('Using login-url:' + loginUrl);
                UserInfoService.getUserInfo().then(
                    function (result) {
                        $log.debug('Populate upper right with: ' + JSON.stringify(result));
                        RIPE.username = result.displayName;
                        RIPE.usermail = result.username;
                        RIPE.usermenu = {
                            'User details': [['Profile', loginUrl + '/profile'], ['Logout', loginUrl + '/logout']]
                        };
                        RIPE.userimg = loginUrl + '/picture/' + result.uuid;
                        RIPE.user = {
                            fullName: result.displayName,
                            email: result.username
                        };
                        init_user_menu();
                        display_user_menu();
                    }
                );
            }

            _initialize();

        }
    ]);
})();
