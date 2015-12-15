/*global window: false */

'use strict';

angular.module('webUpdates')
    .controller('ReclaimController', ['$scope', '$stateParams', '$state', '$log', 'WhoisResources', 'ModalService', 'AlertService', 'RestService', 'STATE',
        function ($scope, $stateParams, $state, $log, WhoisResources, ModalService, AlertService, RestService, STATE) {

            $scope.reclaim = reclaim;
            $scope.isFormValid = _isFormValid;

            var reclaimableObjectTypes = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objectSource = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                if( !_.isUndefined($stateParams.name)) {
                    $scope.objectName = decodeURIComponent($stateParams.name);
                }

                $log.debug('Url params: source:' + $scope.objectSource + '. type:' + $scope.objectType + ', uid:' + $scope.objectName);

                _validateParams();

                if (_isFormValid()){
                    _fetchObject();
                }
            }

            function _fetchObject() {
                RestService.fetchObject($scope.objectSource, $scope.objectType, $scope.objectName, null).then(
                    function (resp) {
                        $scope.restCallInProgress = false;
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);
                        $scope.attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes());
                        _addLinkToReferenceAttributes($scope.attributes);
                        AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp);
                        AlertService.setErrors(whoisResources);

                    }, function (resp) {
                        $scope.restCallInProgress = false;
                        var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                        if (!_.isUndefined(whoisResources)) {
                            AlertService.populateFieldSpecificErrors($scope.objectType, $scope.attributes, resp.data);
                            AlertService.setErrors(whoisResources);
                        }
                    }
                );
            }

            function _isFormValid() {
                return ! AlertService.hasErrors();
            }

            function _validateParams(){
                if (! _.contains(reclaimableObjectTypes, $scope.objectType)){

                    var typesString = _.reduce(reclaimableObjectTypes, function(str, n) {
                        return str + ', ' + n;
                    });

                    AlertService.setGlobalError('Only ' + typesString + ' object types are reclaimable');
                }

                if (_.isUndefined($scope.objectSource)){
                    AlertService.setGlobalError('Source is missing');
                }

                if (_.isUndefined($scope.objectName)){
                    AlertService.setGlobalError('Object key is missing');
                }
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
                if (_isFormValid()){
                    $state.transitionTo('delete', {
                        source: $scope.objectSource,
                        objectType: $scope.objectType,
                        name: $scope.objectName,
                        onCancel: STATE.RECLAIM
                    });
                }
            }

        }]);
