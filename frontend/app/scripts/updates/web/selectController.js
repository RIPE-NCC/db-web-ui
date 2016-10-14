/*global angular*/
(function () {
    'use strict';

    angular.module('webUpdates').controller('SelectController', ['$scope', '$state', 'WhoisResources', 'UserInfoService', 'Properties',

        function ($scope, $state, WhoisResources, UserInfoService, Properties) {
            
            /*
             * UI initialisation
             */
            $scope.objectTypes = _filterObjectTypes(WhoisResources.getObjectTypes());

            $scope.selected = {
                source: Properties.SOURCE,
                objectType: $scope.objectTypes[0]
            };

            $scope.loggedIn = undefined;
            UserInfoService.getUserInfo().then(
                function () {
                    $scope.loggedIn = true;
                }
            );

            function _filterObjectTypes(unfiltered) {
                return _.filter(unfiltered, function (item) {
                    return item !== 'as-block' && item !== 'poem' && item !== 'poetic-form';
                });
            }

            /*
             * Methods called from the html-teplate
             */
            $scope.labelForSource = function (src) {
                return src === 'RIPE' ? 'RIPE    production database' : 'Test database (currently not available)';
            };

            $scope.navigateToCreate = function () {
                if ($scope.selected.objectType === 'mntner') {
                    $state.transitionTo('webupdates.createSelfMnt', {
                        source: $scope.selected.source
                    });
                } else {
                    $state.transitionTo('webupdates.create', {
                        source: $scope.selected.source,
                        objectType: $scope.selected.objectType
                    });
                }
            };

        }]);
})();
