'use strict';

angular.module('textUpdates')
    .controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources',
        'RestService', 'AlertService','ErrorReporterService','MessageStore',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore) {

            $scope.TOTAL_ATTR_LENGTH = 15;

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

                _prepulateText();
            };

            function _prepulateText() {
                var attributesOnObjectType = WhoisResources.getAllAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(attributesOnObjectType)) {
                    $state.transitionTo('notFound');
                    return
                }

                _enrich(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributesOnObjectType)
                );
            }

            function _enrich(attributes) {
                attributes.setSingleAttributeOnName('source', $scope.object.source);
                attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                // other org-types only settable with override
                attributes.setSingleAttributeOnName('org-type', 'OTHER');

                _enrichWithSsoMntners(attributes);

                return attributes;
            }

            function _enrichWithSsoMntners(attributes) {
                $scope.restCalInProgress = true;
                RestService.fetchMntnersForSSOAccount().then(
                    function (ssoMntners) {
                        $scope.restCalInProgress = false;
                        var enrichedAttrs = _addSsoMntnersAsMntBy(attributes, ssoMntners);
                        _capitaliseMandatory(enrichedAttrs);
                        $scope.object.rpsl = _toRpsl(enrichedAttrs);
                    }, function (error) {
                        $scope.restCalInProgress = false;
                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        _capitaliseMandatory(attributes);
                        $scope.object.rpsl = _toRpsl(attributes);
                    }
                );
            }

            function _addSsoMntnersAsMntBy(attributes, mntners) {
                // keep existing
                if( mntners.length === 0 ) {
                    return attributes;
                }

                // merge mntners into attributes
                var mntnersAsAttrs = _.map(mntners, function (item) {
                    return {name: 'mnt-by', value: item.key};
                });
                var attrsWithMntners = attributes.addAttrsSorted('mnt-by', mntnersAsAttrs);

                // strip mnt-by without value from attributes
                return _.filter(attrsWithMntners, function(item) {
                    return !(item.name === 'mnt-by' && _.isUndefined(item.value));
                });
            }

            function _toRpsl(attributes) {
                var rpslData = '';
                _.each(attributes, function (item) {
                    rpslData = rpslData.concat(_.padRight(item.name + ':', $scope.TOTAL_ATTR_LENGTH, ' '));
                    if (!_.isUndefined(item.value)) {
                        rpslData = rpslData.concat(item.value);
                    }
                    rpslData = rpslData.concat('\n');
                });
                return rpslData;
            }

            function _capitaliseMandatory(attributes) {
                _.each(attributes, function(attr) {
                    if(attr.$$meta.$$mandatory) {
                        attr.name = attr.name.toUpperCase();
                    }
                });
            }

            function submit() {
                var passwords = undefined;

                var attributes = _fromRpsl($scope.object.rpsl);

                $scope.restCalInProgress = true;
                RestService.createObject($scope.object.source, $scope.object.type,
                    WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords).then(
                    function(result) {
                        $scope.restCalInProgress = false;

                        var whoisResources = WhoisResources.wrapWhoisResources(result);
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        _navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Create');

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

            function _fromRpsl(rpsl) {
                var attrs = [];
                _.each(rpsl.split('\n'), function(item) {
                    var splitted = item.split(':');
                    if( splitted.length > 0 && !_.isUndefined(splitted[0]) && !_.isEmpty(_.trim(splitted[0]))) {
                        var valueWithComment = undefined;
                        if(!_.isUndefined(splitted[1]) && !_.isEmpty(_.trim(splitted[1]))) {
                            valueWithComment = _.trim(splitted[1]);
                        }
                        attrs.push( {name: _.trim(splitted[0]), value: valueWithComment} );
                    }
                });
                return attrs;
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
