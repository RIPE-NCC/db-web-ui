'use strict';

angular.module('webUpdates')
    .controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResources', 'MessageStore', 'RestService', 'AlertService',
        function ($scope, $stateParams, $state, $resource, WhoisResources, MessageStore, RestService, AlertService) {

            var onCreate = function() {

                /*
                 * Start of initialisation phase
                 */

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.objectName = $stateParams.name;
                $scope.method = $stateParams.method; // optional: added by create- and modify-controller

                $scope.before = undefined;
                $scope.after = undefined;

                // fetch just created object from temporary store
                var cached = MessageStore.get($scope.objectName);
                if (cached) {
                    var whoisResources = WhoisResources.wrapWhoisResources(cached);
                    $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                    AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, cached);
                    AlertService.setErrors(whoisResources);

                    if ($scope.method === 'Modify') {

                        var diff = WhoisResources.wrapAttributes(MessageStore.get('DIFF'));
                        if (!_.isUndefined(diff)) {
                            $scope.before = diff.toPlaintext();
                            $scope.after = $scope.attributes.toPlaintext();
                        }
                    }

                } else {
                    RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, null).then(
                        function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                            AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp);
                            AlertService.setErrors(whoisResources);

                        }, function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                            if (!_.isUndefined(whoisResources)) {
                                AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp.data);
                                AlertService.setErrors(whoisResources);
                            }
                        }
                    );
                }

                /*
                 * End of initialisation phase
                 */
            };
            onCreate();

            /*
             * Methods called from the html-teplate
             */

            $scope.hasOperationName = function() {
                if( ! $scope.method ) {
                    return false;
                }
                return true;
            };

            $scope.getOperationName = function() {
                var name = ''   ;
                if( $scope.method ) {
                    if ($scope.method === 'Create') {
                        name = 'created';
                    } else if ($scope.method === 'Modify') {
                        name = 'modified';
                    }
                }
                return name;
            };

            $scope.navigateToSelect = function () {
                $state.transitionTo('select');
            };

            $scope.navigateToModify = function () {
                $state.transitionTo('modify', {
                    source: $scope.objectSource,
                    objectType: $scope.objectType,
                    name: $scope.objectName
                });
            };

            $scope.isDiff = function() {
                return !_.isUndefined($scope.before) && !_.isUndefined($scope.after);
            };

        }]);
