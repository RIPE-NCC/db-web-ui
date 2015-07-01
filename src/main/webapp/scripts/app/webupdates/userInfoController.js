'use strict';

angular.module('webUpdates')
    .controller('UserInfoController', ['$scope', '$stateParams', '$state', 'UserInfoService',
        function ($scope, $stateParams, $state, UserInfoService) {

            _init();

            function _init() {
                UserInfoService.init(_displayUserMenu());
            }

            function _displayUserMenu() {
                console.log('display user menu');

                RIPE.username = UserInfoService.getDisplayName();
                RIPE.usermenu = {
                    "User details": [["Profile", "https://access.ripe.net/profile"], ["Logout", "https://access.ripe.net/logout"]]
                };
                RIPE.userimg =  "https://access.ripe.net/picture/" + UserInfoService.getUuid();

                init_user_menu();
                display_user_menu();
            }
        }
]);
