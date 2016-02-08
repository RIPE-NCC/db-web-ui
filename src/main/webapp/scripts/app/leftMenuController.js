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
                } else { // webupdates, textupdates etc
                    _expandWebUpdatesMenu();
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
