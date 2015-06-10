'use strict';

angular.module('webUpdates')
    .controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResources', 'MessageStore',
        function ($scope, $stateParams, $state, $resource, WhoisResources, MessageStore) {


            /*
             * Start of initialisation phase
             */
            var onCreate = function() {

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.objectName = $stateParams.name;
                $scope.method = $stateParams.method; // optional: added by create- and modify-controller

                // Initalize the UI
                $scope.errors = [];
                $scope.warnings = [];
                $scope.infos = [];

                var populateFieldSpecificErrors = function (resp) {
                    _.map($scope.attributes, function (attr) {
                        // keep existing error messages
                        if (!attr.$$error) {
                            var errors = resp.getErrorsOnAttribute(attr.name, attr.value);
                            if (errors && errors.length > 0) {
                                attr.$$error = errors[0].plainText;
                            }
                        }
                        return attr;
                    });
                };

                var setErrors = function (whoisResources) {
                    populateFieldSpecificErrors(whoisResources);
                    $scope.errors = whoisResources.getGlobalErrors();
                    $scope.warnings = whoisResources.getGlobalWarnings();
                    $scope.infos = whoisResources.getGlobalInfos();
                };


                var fetchObjectViaRest = function () {
                    $resource('api/whois/:source/:objectType/:objectName', {
                        source: $scope.objectSource,
                        objectType: $scope.objectType,
                        objectName: $scope.objectName
                    })
                        .get(function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                            setErrors(whoisResources);
                        }, function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                            if (!_.isUndefined(whoisResources)) {
                                setErrors(whoisResources);
                            }
                        });
                };

                // fetch just created object from temporary store
                var cached = MessageStore.get($scope.objectName);
                if (cached) {
                    var whoisResources = WhoisResources.wrapWhoisResources(cached);
                    // Use version that we was just before created or modified
                    $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                    setErrors(whoisResources);
                } else {
                    fetchObjectViaRest();
                }

                /*
                 * End of initialisation phase
                 */
            };
            onCreate();

            /*
             * Methods called from the html-teplate
             */

            $scope.attributeHasError = function (attribute) {
                return attribute.$$error !== null;
            };

            $scope.hasOperationName = function() {
                if( ! $scope.method ) {
                    return false;
                }
                return true;
            };

            $scope.getOperationName = function() {
                var name = "";
                if( $scope.method ) {
                    if ($scope.method === "Create") {
                        name = "created";
                    } else if ($scope.method === "Modify") {
                        name = "modified";
                    }
                }
                return name;
            };

            $scope.hasErrors = function () {
                return $scope.errors.length > 0;
            };

            $scope.hasWarnings = function () {
                return $scope.warnings.length > 0;
            };

            $scope.hasInfos = function () {
                return $scope.infos.length > 0;
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



        }]);
