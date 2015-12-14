/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimSelectController', ['$scope', '$stateParams', '$state', 'SOURCE', 'WhoisResources', 'UserInfoService', '$log',
        function ($scope, $stateParams, $state, source, WhoisResources, UserInfoService, $log) {

            _initialisePage();

            function _initialisePage() {

                $scope.objectTypes = _filterObjectTypes(WhoisResources.getObjectTypes());

                $scope.selected = {
                    source: source,
                    objectType: $scope.objectTypes[0],
                    name: ''
                };

                $scope.loggedIn = undefined;
                UserInfoService.getUserInfo().then(
                    function (userData) {
                        $scope.loggedIn = true;
                    }
                );
            }

            $scope.navigateToReclaim = function () {
                $state.transitionTo('reclaim', {
                    source: $scope.selected.source,
                    objectType: $scope.selected.objectType,
                    name: $scope.selected.name
                });

            };

            function _filterObjectTypes( unfiltered) {
                return _.filter(unfiltered, function(item) {
                    var reclaimableTypes= ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

                    return _.contains(reclaimableTypes, item);
                });
            }

        }]);
