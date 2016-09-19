/*global angular*/

(function () {
    'use strict';

    angular.module('menu').controller('LeftMenuController', ['$scope', '$rootScope', '$log',

        function ($scope, $rootScope, $log) {

            $scope.menu = {};

            $rootScope.$on('dbWebApp.moduleActive', function (event, data) {
                if (data === 'search') {
                    expandSearchMenu();
                } else if (data === 'passwords') {
                    expandPasswordsMenu();
                } else if (data === 'updates') {
                    expandWebUpdatesMenu();
                } else {
                    $log.error('LeftMenuController: Received unrecognized value ' + data + ' for event ' + event.name);
                }
            });

            function expandSearchMenu() {
                $scope.menu = {
                    searchExpanded: true
                };
            }

            function expandWebUpdatesMenu() {
                $scope.menu = {
                    webUpdatesExpanded: true
                };
            }

            function expandPasswordsMenu() {
                $scope.menu = {
                    passwordsExpanded: true
                };
            }
        }
    ]);
})();
