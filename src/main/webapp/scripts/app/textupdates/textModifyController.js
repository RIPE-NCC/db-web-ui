'use strict';

angular.module('textUpdates')
    .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log',
        'WhoisResources', 'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService', 'PreferenceService',
        function ($scope, $stateParams, $state, $resource, $log,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore, RpslService, PreferenceService) {

            $scope.submit = submit;
            $scope.switchToWebMode = switchToWebMode;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                // extract parameters from the url
                $scope.object = {}
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;
                $scope.object.name = decodeURIComponent($stateParams.name);
                if( !_.isUndefined($stateParams.rpsl)) {
                    $scope.object.rpsl = decodeURIComponent($stateParams.rpsl);
                }
                var noRedirect = $stateParams.noRedirect;

                $log.debug('TextModifyController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', object.name:' + $scope.object.name +
                    ', noRedirect:' + noRedirect);

                if( PreferenceService.isWebMode() && ! noRedirect === true ) {
                    switchToWebMode();
                }

                if(_.isUndefined($scope.object.rpsl) ) {
                    _fetchAndPopulateObject();
                }
            };

            function _fetchAndPopulateObject() {
                $scope.restCalInProgress = true;
                RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name).then(
                    function (result) {
                        $scope.restCalInProgress = false;

                        var whoisResources = WhoisResources.wrapWhoisResources(result);

                        $scope.object.rpsl = RpslService.toRpsl(whoisResources.getAttributes());
                        MessageStore.add('DIFF', whoisResources.getAttributes());

                    }, function (error) {
                        $scope.restCalInProgress = false;

                        if (_.isUndefined(error.data)) {
                            $log.error('Response not understood:'+JSON.stringify(error));
                            return;
                        }

                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        AlertService.setAllErrors(whoisResources);
                        if(!_.isUndefined(whoisResources.getAttributes())) {
                            var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, whoisResources.getAttributes());
                            ErrorReporterService.log('Modify', $scope.object.type, AlertService.getErrors(), attributes);
                        }
                    }
                );
            }

            function submit() {
                var passwords = undefined;

                var objects = RpslService.fromRpsl($scope.object.rpsl);
                if( objects.length > 1 ) {
                    AlertService.setGlobalError('Only a single object is allowed');
                    return;
                }
                var attributes = objects[0];

                $scope.restCalInProgress = true;

                RestService.modifyObject($scope.object.source, $scope.object.type, $scope.object.name,
                    WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords).then(
                    function(result) {
                        $scope.restCalInProgress = false;

                        var whoisResources = WhoisResources.wrapWhoisResources(result);
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        _navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Modify');

                    },function(error) {
                        $scope.restCalInProgress = false;

                        if (_.isUndefined(error.data)) {
                            $log.error('Response not understood:'+JSON.stringify(error));
                            return;
                        }

                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        AlertService.setAllErrors(whoisResources);

                        if(!_.isUndefined(whoisResources.getAttributes())) {
                            var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, whoisResources.getAttributes());
                            ErrorReporterService.log('Modify', $scope.object.type, AlertService.getErrors(), attributes);
                        }

                    }
                );
            }

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }

            function switchToWebMode() {
                $log.debug("Switching to web-mode");

                PreferenceService.setWebMode();

                $state.transitionTo('webupdates.modify', {
                    source: $scope.object.source,
                    objectType: $scope.object.type,
                    name:$scope.object.name,
                });
            }
        }]);
