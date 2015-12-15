'use strict';

angular.module('textUpdates')
    .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources',
        'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore,RpslService) {


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

              //  _prepulateText();
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
                        $scope.object.rpsl = RpslService.toRpsl(enrichedAttrs);
                    }, function (error) {
                        $scope.restCalInProgress = false;
                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        _capitaliseMandatory(attributes);
                        $scope.object.rpsl = RpslService.toRpsl(attributes);
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

            function _capitaliseMandatory(attributes) {
                _.each(attributes, function(attr) {
                    if(attr.$$meta.$$mandatory) {
                        attr.name = attr.name.toUpperCase();
                    }
                });
            }

            function submit() {
                var passwords = undefined;

                var attributes = RpslService.fromRpsl($scope.object.rpsl);

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

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }
        }]);
