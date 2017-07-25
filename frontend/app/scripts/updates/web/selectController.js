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
                objectType: "person-mntnr"
            };

            $scope.loggedIn = undefined;

            UserInfoService.getUserOrgsAndRoles().then(
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
                } else if ($scope.selected.objectType === 'domain') {
                   $state.transitionTo('webupdates.domainobjectwizard', {
                       source: $scope.selected.source,
                       objectType: $scope.selected.objectType
                   });
                } else if ($scope.selected.objectType === 'person-mntnr') {
                    $state.transitionTo('webupdates.createPersonMntnerPair');
                } else {
                    $state.transitionTo('webupdates.create', {
                        source: $scope.selected.source,
                        objectType: $scope.selected.objectType
                    });
                }
            };

            function filterObjectTypes(unfiltered) {
                return _.filter(unfiltered, function (item) {
                    return item !== 'as-block' && item !== 'poem' && item !== 'poetic-form';
                });
            }

        }]);
})();
