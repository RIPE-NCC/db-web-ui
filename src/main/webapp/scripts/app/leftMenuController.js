'use strict';

angular.module('dbWebApp')
    .controller('LeftMenuController', ['$scope', '$rootScope', '$log',
        function ($scope, $rootScope, $log) {

            $scope.menu = {};

            $rootScope.$on('dbWebApp.moduleActive', function (event, data) {
                if (data === 'search') {
                    _expandSearchMenu();
                } else if (data === 'passwords') {
                    _expandPasswordsMenu();
                } else if (data === 'webUpdates') {
                    _expandWebUpdatesMenu();
                } else {
                   $log.error('LeftMenuController: Received unrecognized value ' + data + ' of event ' + event.name );
                }
            });

            function _expandSearchMenu() {
                $scope.menu = {
                    searchExpanded: true
                };
            }

            function _expandWebUpdatesMenu() {
                $scope.menu = {
                    webUpdatesExpanded: true
                };
            }

            function _expandPasswordsMenu() {
                $scope.menu = {
                    passwordsExpanded: true
                };
            }
        }
    ]);
