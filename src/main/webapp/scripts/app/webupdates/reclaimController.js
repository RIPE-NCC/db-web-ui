/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'ModalService', 'AlertService', 'RestService', 'STATE',
        function ($scope, $stateParams, $state, $log, WhoisResources, ModalService, AlertService, RestService, STATE) {

            $scope.reclaim = reclaim;

            var reclaimableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

            _initialisePage();

            function _initialisePage() {
                $scope.restCallInProgress = true;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                if( !_.isUndefined($stateParams.name)) {
                    $scope.objectName = decodeURIComponent($stateParams.name);
                }

                $log.debug('Url params: source:' + $scope.objectSource + '. type:' + $scope.objectType + ', uid:' + $scope.objectName);

                if (_validateParams($scope.objectSource, $scope.objectType, $scope.objectName)){
                    _fetchObject();
                } else {
                    $scope.isFormValid == false;
                }
            }

            function _fetchObject() {
                RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, null).then(
                    function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);
                        $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                        _addLinkToReferenceAttributes($scope.attributes);
                        AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp);
                        AlertService.setErrors(whoisResources);
                        $scope.restCallInProgress = false;

                    }, function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                        if (!_.isUndefined(whoisResources)) {
                            AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp.data);
                            AlertService.setErrors(whoisResources);
                        }
                    }
                );
            }

            function _validateParams(objectSource, objectType, objectName){
                if (! _.contains(reclaimableObjectTypes, objectType)){

                    var typesString = _.reduce(reclaimableObjectTypes, function(str, n) {
                        return str + ', ' + n;
                    });

                    AlertService.setGlobalError('Only ' + typesString + ' object types are reclaimable');
                    return false;
                }

                if (_.isUndefined(objectSource)){
                    AlertService.setGlobalError('Source is missing');
                    return false;
                }

                if (_.isUndefined(objectName)){
                    AlertService.setGlobalError('Object key is missing');
                    return false;
                }

                return true;
            }

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

            function reclaim () {
                $state.transitionTo('delete', {
                    source: $scope.objectSource,
                    objectType: $scope.objectType,
                    name: $scope.objectName,
                    onCancel: STATE.RECLAIM
                });
            }

        }]);
