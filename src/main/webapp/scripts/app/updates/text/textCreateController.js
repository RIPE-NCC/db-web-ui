/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates').controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$q', '$window',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService', 'MessageStore',
        'RpslService', 'TextCommons', 'PreferenceService',
        
        function ($scope, $stateParams, $state, $resource, $log, $q, $window,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore,
                  RpslService, TextCommons, PreferenceService) {

            $scope.submit = submit;
            $scope.switchToWebMode = switchToWebMode;
            $scope.cancel = cancel;

            _initialisePage();

            function _initialisePage() {

                $scope.restCalInProgress = false;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.object = {};
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;
                if (!_.isUndefined($stateParams.rpsl)) {
                    $scope.object.rpsl = decodeURIComponent($stateParams.rpsl);
                }
                var redirect = !$stateParams.noRedirect;

                // maintainers associated with this SSO-account
                $scope.mntners = {};
                $scope.mntners.sso = [];

                $log.debug('TextCreateController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', noRedirect:' + !redirect);

                if (PreferenceService.isWebMode() && redirect) {
                    switchToWebMode();
                }

                if (_.isUndefined($scope.object.rpsl)) {
                    _prepopulateRpsl();
                }
            }

            function _prepopulateRpsl() {
                var attributesOnObjectType = WhoisResources.getAllAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(attributesOnObjectType)) {
                    $log.error('Object type ' + $scope.object.type + ' was not found');
                    $state.transitionTo('notFound');
                    return;
                }

                _enrichAttributes(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributesOnObjectType)
                );
            }

            function _enrichAttributes(attributes) {
                TextCommons.enrichWithDefaults($scope.object.source, $scope.object.type, attributes);

                _enrichAttributesWithSsoMntners(attributes).then(
                    function (attributes) {
                        TextCommons.capitaliseMandatory(attributes);
                        var obj = {
                            attributes: attributes,
                            passwords: $scope.passwords,
                            override: $scope.override
                        };
                        $scope.object.rpsl = RpslService.toRpsl(obj);
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

                    },
                    function (error) {
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

            function submit() {
                AlertService.clearErrors();

                $log.debug('rpsl:' + $scope.object.rpsl);

                // parse
                var objects = RpslService.fromRpsl($scope.object.rpsl);
                if (objects.length > 1) {
                    AlertService.setGlobalError('Only a single object is allowed');
                    return;
                }
                $scope.passwords = objects[0].passwords;
                $scope.override = objects[0].override;
                var attributes = TextCommons.uncapitalize(objects[0].attributes);
                $log.debug('attributes:' + JSON.stringify(attributes));

                if (!TextCommons.validate($scope.object.type, attributes)) {
                    return;
                }

                var undefinedName;
                TextCommons.authenticate('Create', $scope.object.source, $scope.object.type, undefinedName, $scope.mntners.sso,
                    attributes, $scope.passwords, $scope.override).then(
                    function (authenticated) {
                        $log.debug('Authenticated successfully:' + authenticated);

                        // combine all passwords
                        var combinedPaswords = _.union($scope.passwords, TextCommons.getPasswordsForRestCall($scope.object.type));

                        attributes = TextCommons.stripEmptyAttributes(attributes);

                        // rest-POST to server
                        $scope.restCalInProgress = true;
                        RestService.createObject($scope.object.source, $scope.object.type,
                            WhoisResources.turnAttrsIntoWhoisObject(attributes),
                            combinedPaswords, $scope.override, true).then(
                            function (result) {
                                $scope.restCalInProgress = false;

                                var whoisResources = result;
                                MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                                TextCommons.navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Create');

                            },
                            function (error) {
                                $scope.restCalInProgress = false;

                                var whoisResources = error.data;
                                AlertService.setAllErrors(whoisResources);
                                if (!_.isEmpty(whoisResources.getAttributes())) {
                                    ErrorReporterService.log('TextCreate', $scope.object.type, AlertService.getErrors(), whoisResources.getAttributes());
                                }

                            }
                        );
                    }, function (authenticated) {
                        $log.error('Authentication failure:' + authenticated);

                    }
                );
            }

            function cancel() {
                if ($window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
                    $state.transitionTo('webupdates.select');
                }
            }

            function switchToWebMode() {
                $log.debug('Switching to web-mode');

                PreferenceService.setWebMode();

                $state.transitionTo('webupdates.create', {
                    source: $scope.object.source,
                    objectType: $scope.object.type
                });
            }

        }]);
})();
