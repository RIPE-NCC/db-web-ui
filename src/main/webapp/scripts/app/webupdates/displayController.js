'use strict';

angular.module('webUpdates')
    .controller('DisplayController', ['$scope', '$stateParams', '$state', '$resource', '$log', 'WhoisResources', 'MessageStore', 'RestService', 'AlertService', 'UserInfoService',
        function ($scope, $stateParams, $state, $resource, $log, WhoisResources, MessageStore, RestService, AlertService, UserInfoService) {

            $scope.modifyButtonToBeShown = modifyButtonToBeShown;
            $scope.isCreateOrModify = isCreateOrModify;
            $scope.getOperationName = getOperationName;
            $scope.navigateToSelect = navigateToSelect;
            $scope.navigateToModify = navigateToModify;
            $scope.isDiff = isDiff;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                /*
                 * Start of initialisation phase
                 */

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                // url-decode otherwise newly-created resource is MessageStore wiill not be found
                $scope.objectName = decodeURIComponent($stateParams.name);
                $scope.method = $stateParams.method; // optional: added by create- and modify-controller

                $log.debug('DisplayController: Url params: source:'+ $scope.objectSource + '. objectType:' + $scope.objectType +
                    ', objectName:' + $scope.objectName + ', method:' + $scope.method );

                $scope.before = undefined;
                $scope.after = undefined;

                // needed to determine name of modify button
                $scope.loggedIn = undefined;
                UserInfoService.getUserInfo().then(
                    function (userData) {
                        $scope.loggedIn = true;
                    }
                );

                // fetch just created object from temporary store
                var cached = MessageStore.get($scope.objectName);
                if (!_.isUndefined(cached)) {
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
                    _addLinkToReferenceAttributes($scope.attributes);
                } else {
                    RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, null).then(
                        function (resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                            _addLinkToReferenceAttributes($scope.attributes);
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
            };

            /*
             * Methods called from the html-teplate
             */

            function modifyButtonToBeShown() {
                return !AlertService.hasErrors() && !isPending();
            }

            function isPending() {
                if(!_.isUndefined($scope.method) && $scope.method === "Pending") {
                    return true;
                }
                return false;
            };

            function isCreateOrModify() {
                if( _.isUndefined($scope.method) || $scope.isPending() ) {
                    return false;
                }
                return true;
            };

           function getOperationName() {
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

            function navigateToSelect() {
                $state.transitionTo('select');
            };

            function navigateToModify() {
                $state.transitionTo('modify', {
                    source: $scope.objectSource,
                    objectType: $scope.objectType,
                    name: $scope.objectName
                });
            };

            function isDiff() {
                return !_.isUndefined($scope.before) && !_.isUndefined($scope.after);
            };

            function _addLinkToReferenceAttributes(attributes) {
                var parser = document.createElement('a');
                return _.map(attributes, function(attribute) {
                    if (!_.isUndefined(attribute.link)) {
                        attribute.link.uiHref = _displayUrl(parser, attribute);
                    }
                    return attribute;
                } );
            }

            function _displayUrl(parser, attribute) {
                parser.href = attribute.link.href;
                var parts = parser.pathname.split('/');

                return $state.href('display', {
                    source: $scope.objectSource,
                    objectType: attribute['referenced-type'],
                    name: _.last(parts)
                });
            };

        }]);
