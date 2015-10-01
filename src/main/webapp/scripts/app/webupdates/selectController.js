'use strict';

angular.module('webUpdates')
    .controller('SelectController', ['$scope', '$state', 'WhoisResources', 'UserInfoService', 'SOURCE',
        function ($scope, $state, WhoisResources, UserInfoService, source) {
            /*
             * UI initialisation
             */
            $scope.objectTypes = WhoisResources.getObjectTypes();

            $scope.selected = {
                //source: $scope.sources[0],
                source: source,
                objectType: $scope.objectTypes[0]
            };

            $scope.loggedIn = false;
            UserInfoService.getUserInfo().then(
                function (userData) {
                    $scope.loggedIn = true;
                }
            );

            /*
             * Methods called from the html-teplate
             */
            $scope.labelForSource = function (src) {
                return src === 'RIPE' ? 'RIPE    production database' : 'Test database (currently not available)';
            }

            $scope.navigateToCreate = function () {
                if ($scope.selected.objectType === 'mntner'){
                    $state.transitionTo('createSelfMnt', {
                        source: $scope.selected.source,
                    });
                } else {
                    $state.transitionTo('create', {
                        source: $scope.selected.source,
                        objectType: $scope.selected.objectType
                    });
                }
            };

        }]);
