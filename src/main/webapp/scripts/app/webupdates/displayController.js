'use strict';

angular.module('webUpdates')
    .controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', '$log', 'WhoisResources', 'MessageStore', 'RestService', 'AlertService',
        function ($scope, $stateParams, $state, $resource, $log, WhoisResources, MessageStore, RestService, AlertService) {

            var onCreate = function() {

                AlertService.clearErrors();

                /*
                 * Start of initialisation phase
                 */

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.objectName = $stateParams.name;
                $scope.method = $stateParams.method; // optional: added by create- and modify-controller

                $log.info('Url params: source:'+ $scope.objectSource +'. type:' + $scope.objectType + ', uid:' + $scope.objectName );

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
                    addLinkToReferenceAttributes($scope.attributes);
                } else {
                    RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, null).then(
                        function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                            addLinkToReferenceAttributes($scope.attributes);
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

            function addLinkToReferenceAttributes(attributes) {
                var parser = document.createElement('a');
                return _.map(attributes, function(attribute) {
                    if (!_.isUndefined(attribute.link)) {
                        attribute.link.uiHref = displayUrl(parser, attribute);
                    }
                    return attribute;
                } );
            }

            function displayUrl(parser, attribute) {
                parser.href = attribute.link.href;
                var parts = parser.pathname.split('/');

                return $state.href('display', {
                    source: $scope.objectSource,
                    objectType: attribute['referenced-type'],
                    name: _.last(parts)
                });
            };

        }]);
