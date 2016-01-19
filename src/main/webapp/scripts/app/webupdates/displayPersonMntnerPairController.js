'use strict';

angular.module('webUpdates')
    .controller('DisplayPersonMntnerPairController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'MessageStore', 'RestService','AlertService',
        function ($scope, $stateParams, $state, $log, WhoisResources, MessageStore, RestService,  AlertService) {

            var _initialisePage = function() {
                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.personName = $stateParams.person;
                $scope.mntnerName = $stateParams.mntner;

                // fetch just created object from temporary store
                var cachedPersonObject = MessageStore.get($scope.personName);
                if (cachedPersonObject) {
                    var whoisResources = WhoisResources.wrapWhoisResources(cachedPersonObject);
                    $scope.personAttributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                    $log.debug('Got person from cache:' + JSON.stringify($scope.personAttributes ));
                } else {
                    RestService.fetchObject($scope.objectSource, 'person', $scope.personName, null).then(
                        function (resp) {
                            $scope.personAttributes = resp.getAttributes();
                            AlertService.populateFieldSpecificErrors('person', $scope.personAttributes, resp);
                            AlertService.addErrors(resp);
                        },
                        function (error) {
                            AlertService.populateFieldSpecificErrors('person', $scope.personAttributes, error.data);
                            AlertService.addErrors(error.data);
                        });
                }

                var cachedMntnerObject = MessageStore.get($scope.mntnerName);
                if (cachedMntnerObject) {
                    var whoisResources = WhoisResources.wrapWhoisResources(cachedMntnerObject);
                    $scope.mntnerAttributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                    $log.debug('Got mntner from cache:' + JSON.stringify($scope.mntnerAttributes ));
                } else {
                    RestService.fetchObject($scope.objectSource, 'mntner', $scope.mntnerName, null).then(
                        function (resp) {
                            $scope.mntnerAttributes = resp.getAttributes();
                            AlertService.populateFieldSpecificErrors('mntner', $scope.mntnerAttributes, resp);
                            AlertService.addErrors(resp);
                        },
                        function (error) {
                            AlertService.populateFieldSpecificErrors('mntner', $scope.mntnerAttributes, error.data);
                            AlertService.addErrors(error.data);
                        });
                }
            }

            _initialisePage();

            $scope.navigateToSelect = function () {
                $state.transitionTo('webupdates.select');
            };

            $scope.navigateToModifyPerson = function () {
                $state.transitionTo('webupdates.modify', {
                    source: $scope.objectSource,
                    objectType: 'person',
                    name: $scope.personName
                });
            };

            $scope.navigateToModifyMntner = function () {
                $state.transitionTo('webupdates.modify', {
                    source: $scope.objectSource,
                    objectType: 'mntner',
                    name: $scope.mntnerName
                });
            };

            $scope.navigateToSharedMntner = function () {
                $state.transitionTo('webupdates.createSelfMnt', {
                    source: $scope.objectSource,
                    objectType: 'mntner',
                    admin:$scope.personName
                });
            };

        }]);
