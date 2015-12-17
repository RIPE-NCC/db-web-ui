'use strict';

angular.module('textUpdates')
    .controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', '$q',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService', 'MessageStore',
        'RpslService', 'TextCommons',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore,
                  RpslService, TextCommons) {

            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                $scope.restCalInProgress = false;

                AlertService.clearErrors();

                $cookies.put('ui-mode', 'textupdates');

                // extract parameters from the url
                $scope.object = {}
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;

                // maintainers associated with this SSO-account
                $scope.mntners = {}
                $scope.mntners.sso = [];

                $log.debug('TextCreateController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type);

                _prepopulateRpsl();
            };

            function _prepopulateRpsl() {
                var attributesOnObjectType = WhoisResources.getAllAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(attributesOnObjectType)) {
                    $state.transitionTo('notFound');
                    return
                }

                _enrichAttributes(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributesOnObjectType)
                );
            }

            function _enrichAttributes(attributes) {

                TextCommons.enrichWithDefaults($scope.object.source, $scope.object.type, attributes);

                _enrichAttributesWithSsoMntners(attributes).then(
                    function (attributes) {
                        _capitaliseMandatory(attributes);
                        $scope.object.rpsl = RpslService.toRpsl(attributes);
                    }
                );

                return attributes;
            }

            function _enrichAttributesWithSsoMntners(attributes) {
                var deferredObject = $q.defer();

                $scope.restCalInProgress = true;
                RestService.fetchMntnersForSSOAccount().then(
                    function (ssoMntners) {
                        $scope.restCalInProgress = false;

                        $scope.mntners.sso = ssoMntners;

                        var enrichedAttrs = _addSsoMntnersAsMntBy(attributes, ssoMntners);
                        deferredObject.resolve(enrichedAttrs);

                    }, function (error) {
                        $scope.restCalInProgress = false;

                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        deferredObject.resolve(attributes);
                    }
                );

                return deferredObject.promise;
            }

            function _addSsoMntnersAsMntBy(attributes, mntners) {
                // keep existing
                if (mntners.length === 0) {
                    return attributes;
                }

                // merge mntners into json-attributes
                var mntnersAsAttrs = _.map(mntners, function (item) {
                    return {name: 'mnt-by', value: item.key};
                });
                var attrsWithMntners = attributes.addAttrsSorted('mnt-by', mntnersAsAttrs);

                // strip mnt-by without value from attributes
                return _.filter(attrsWithMntners, function (item) {
                    return !(item.name === 'mnt-by' && _.isUndefined(item.value));
                });
            }

            function _capitaliseMandatory(attributes) {
                _.each(attributes, function (attr) {
                    if (attr.$$meta.$$mandatory) {
                        attr.name = attr.name.toUpperCase();
                    }
                });
            }

            function submit() {
                AlertService.clearErrors();

                $log.debug("rpsl:" + $scope.object.rpsl);

                // parse
                var passwords = [];
                var overrides = [];
                var attributes = RpslService.fromRpslWithPasswords($scope.object.rpsl, passwords, overrides);

                attributes = _uncapitalize(attributes);
                $log.debug("attributes:" + JSON.stringify(attributes));

                if (!TextCommons.validate($scope.object.type, attributes)) {
                    return;
                }

                if (!TextCommons.authenticate($scope.object.source, $scope.object.type, $scope.mntners.sso, attributes, passwords, overrides)) {
                    return;
                }

                attributes = TextCommons.stripEmptyAttributes(attributes);

                // rest-POST to server
                $scope.restCalInProgress = true;
                RestService.createObject($scope.object.source, $scope.object.type,
                    WhoisResources.turnAttrsIntoWhoisObject(attributes),
                    passwords, overrides, true).then(
                    function (result) {
                        $scope.restCalInProgress = false;

                        var whoisResources = WhoisResources.wrapWhoisResources(result);
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        TextCommons.navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Create');

                    }, function (error) {
                        $scope.restCalInProgress = false;

                        if (_.isUndefined(error.data)) {
                            $log.error('Response not understood:' + JSON.stringify(error));
                            return;
                        }

                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        AlertService.setAllErrors(whoisResources);
                        if (!_.isUndefined(whoisResources.getAttributes())) {
                            var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, whoisResources.getAttributes());
                            ErrorReporterService.log('Create', $scope.object.type, AlertService.getErrors(), attributes);
                        }
                    }
                );
            }

            function _uncapitalize(attributes) {
                return WhoisResources.wrapAttributes(
                    _.map(attributes, function (attr) {
                        attr.name = attr.name.toLowerCase();
                        return attr;
                    })
                );
            }

        }]);
