/*global angular, display_user_menu, init_user_menu, RIPE */
(function () {
    'use strict';

    angular.module('loginStatus').controller('UserInfoController', ['$scope', '$log', 'UserInfoService', 'Properties',

        function ($scope, $log, UserInfoService, Properties) {

            function initialize() {
                $log.debug('Using login-url:' + Properties.LOGIN_URL);
                UserInfoService.getUserOrgsAndRoles().then(
                    function (result) {
                        RIPE.username = result.user.displayName;
                        RIPE.usermail = result.user.username;
                        RIPE.usermenu = {
                            'User details': [['Profile', Properties.LOGIN_URL + '/profile'], ['Logout', Properties.LOGIN_URL + '/logout']]
                        };
                        RIPE.userimg = Properties.LOGIN_URL + '/picture/' + result.user.uuid;
                        RIPE.user = {
                            fullName: result.user.displayName,
                            email: result.user.username,
                            buildTag: Properties.BUILD_TAG
                        };
                        init_user_menu();
                        display_user_menu();
                    }
                );
            }
            initialize();
        }
    ]);
})();
