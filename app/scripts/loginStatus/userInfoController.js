/*global angular, display_user_menu, init_user_menu, RIPE */
(function () {
    'use strict';

    angular.module('loginStatus').controller('UserInfoController', ['$scope', '$log', 'UserInfoService', 'Properties',

        function ($scope, $log, UserInfoService, Properties) {

            function _initialize() {
                UserInfoService.getUserInfo().then(
                    function (result) {
                        RIPE.username = result.displayName;
                        RIPE.usermail = result.username;
                        RIPE.usermenu = {
                            'User details': [['Profile', Properties.LOGIN_URL + '/profile'], ['Logout', Properties.LOGIN_URL + '/logout']]
                        };
                        RIPE.userimg = Properties.LOGIN_URL + '/picture/' + result.uuid;
                        RIPE.user = {
                            fullName: result.displayName,
                            email: result.username,
                            buildTag: Properties.BUILD_TAG
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
