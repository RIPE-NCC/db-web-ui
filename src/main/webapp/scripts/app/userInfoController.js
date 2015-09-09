// jshint ignore: start
/*global window: false */

'use strict';

angular.module('dbWebApp')
    .controller('UserInfoController', ['$scope', '$location', '$window','$log','UserInfoService', 'LOGIN_URL',
        function ($scope, $location, $window, $log, UserInfoService, loginUrl) {

            function _initialize() {
                $log.info('Using login-url:' +  loginUrl);
                UserInfoService.getUserInfo().then(
                    function(result) {
                        _onSuccess(result);
                    }, function(error) {
                        _onFailure(error)
                    }
                );
            }
            _initialize();

            function _onSuccess(result) {
                $log.info('Ppupulate upper right with: ' + JSON.stringify(result));
                RIPE.username = result.displayName;
                RIPE.usermenu = {
                    'User details': [['Profile', loginUrl + '/profile'], ['Logout', loginUrl + '/logout']]
                };
                RIPE.userimg =  loginUrl + '/picture/' + result.uuid;
                init_user_menu();
                display_user_menu();
            }

            function _onFailure(error) {
                var redirectUrl =  loginUrl + '?originalUrl=' + $location.absUrl();
                $log.info('Redirecting to ' + redirectUrl)
                $window.location.href = redirectUrl;
            }
        }
]);
