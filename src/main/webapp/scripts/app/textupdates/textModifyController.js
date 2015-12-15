'use strict';

angular.module('textUpdates')
    .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources',
        'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore, RpslService) {


            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                $cookies.put('ui-mode', 'textupdates');

                // extract parameters from the url
                $scope.object = {}
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;
                $scope.object.name = decodeURIComponent($stateParams.name);

                $log.debug('TextUpdatesController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', object.name:' + $scope.object.name);

                _prepopulateText();
            };

            function _prepopulateText() {
                _fetchObject();
            }

            function _fetchObject() {

                $scope.restCalInProgress = true;
                RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name).then(
                    function (whoisObject) {
                        $scope.restCalInProgress = false;
                        _wrapAndEnrichResources($scope.object.type, whoisObject);
                        $scope.object.rpsl = RpslService.toRpsl(whoisObject.getAttributes());
                    }, function (error) {
                        $scope.restCalInProgress = false;


                    }
                );
            }

            function _wrapAndEnrichResources(objectType, resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.attributes = WhoisResources.wrapAndEnrichAttributes(objectType, whoisResources.getAttributes());
                }
                return whoisResources;
            }

            function submit() {
                var passwords = undefined;

                var attributes = RpslService.fromRpsl($scope.object.rpsl);

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
                            ErrorReporterService.log('Create', $scope.object.type, AlertService.getErrors(), attributes);
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
        }]);
