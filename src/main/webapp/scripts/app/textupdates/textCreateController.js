'use strict';

angular.module('textUpdates')
    .controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources', 'RestService', 'AlertService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService) {

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

            function submit() {
                $scope.restCalInProgress = true;
            }

            function _prepulateText() {
                var mandatoryAttributesOnObjectType = WhoisResources.getMandatoryAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(mandatoryAttributesOnObjectType)) {
                    $state.transitionTo('notFound');
                    return;
                }

                _enrich(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, mandatoryAttributesOnObjectType)
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
                        $scope.object.rpsl = _toRpsl(enrichedAttrs);
                    }, function (error) {
                        $scope.restCalInProgress = false;
                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        $scope.object.rpsl = _toRpsl(attributes);
                    }
                );
            }

            function _addSsoMntnersAsMntBy(attributes, mntners) {
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

        }]);
