/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates').controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$q', '$window',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService', 'MessageStore',
        'RpslService', 'TextCommons', 'PreferenceService', 'MntnerService',

        function ($scope, $stateParams, $state, $resource, $log, $q, $window,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore,
                  RpslService, TextCommons, PreferenceService, MntnerService) {

            $scope.submit = submit;
            $scope.switchToWebMode = switchToWebMode;
            $scope.cancel = cancel;

            initialisePage();

            function initialisePage() {

                $scope.restCallInProgress = false;

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
                    return;
                }

                if (_.isUndefined($scope.object.rpsl)) {
                    prepopulateRpsl();
                }
            }

            function prepopulateRpsl() {
                var attributesOnObjectType = WhoisResources.getAllAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(attributesOnObjectType)) {
                    $log.error('Object type ' + $scope.object.type + ' was not found');
                    $state.transitionTo('notFound');
                    return;
                }

                enrichAttributes(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributesOnObjectType)
                );
            }

            function enrichAttributes(attributes) {
                TextCommons.enrichWithDefaults($scope.object.source, $scope.object.type, attributes);

                enrichAttributesWithSsoMntners(attributes).then(
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

            function enrichAttributesWithSsoMntners(attributes) {
                var deferredObject = $q.defer();

                $scope.restCallInProgress = true;
                RestService.fetchMntnersForSSOAccount().then(
                    function (ssoMntners) {
                        $scope.restCallInProgress = false;

                        $scope.mntners.sso = ssoMntners;

                        var enrichedAttrs = addSsoMntnersAsMntBy(attributes, ssoMntners);
                        deferredObject.resolve(enrichedAttrs);

                    },
                    function (error) {
                        $scope.restCallInProgress = false;

                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');

                        deferredObject.resolve(attributes);
                    }
                );

                return deferredObject.promise;
            }

            function addSsoMntnersAsMntBy(attributes, mntners) {
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

            function doCreate(attributes, objectType) {
                var combinedPaswords = _.union($scope.passwords, TextCommons.getPasswordsForRestCall(objectType));
                attributes = TextCommons.stripEmptyAttributes(attributes);
                // rest-POST to server
                $scope.restCallInProgress = true;
                RestService.createObject($scope.object.source, objectType, WhoisResources.turnAttrsIntoWhoisObject(attributes), combinedPaswords, $scope.override, true).then(
                    function (result) {
                        $scope.restCallInProgress = false;
                        var whoisResources = result;
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        TextCommons.navigateToDisplayPage($scope.object.source, objectType, whoisResources.getPrimaryKey(), 'Create');
                    },
                    function (error) {
                        $scope.restCallInProgress = false;
                        var whoisResources = error.data;
                        AlertService.setAllErrors(whoisResources);
                        if (!_.isEmpty(whoisResources.getAttributes())) {
                            ErrorReporterService.log('TextCreate', objectType, AlertService.getErrors(), whoisResources.getAttributes());
                        }
                    }
                );
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

                // if inet(6)num, find the parent and get some auth for that
                if (['inetnum', 'inet6num'].indexOf($scope.object.type) > -1) {
                    var inetnumAttr = _.find(attributes, function (attr) {
                        return $scope.object.type === attr.name && attr.value;
                    });
                    var sourceAttr = _.find(attributes, function (attr) {
                        return 'source' === attr.name && attr.value;
                    });
                    if (inetnumAttr && sourceAttr) {
                        $scope.restCallInProgress = true;
                        RestService.fetchParentResource(inetnumAttr.name, inetnumAttr.value).get(function (result) {
                            var parent;
                            if (result && result.objects && angular.isArray(result.objects.object)) {
                                parent = result.objects.object[0];
                                if (parent.attributes && angular.isArray(parent.attributes.attribute)) {
                                    var parentObject = WhoisResources.wrapAttributes(parent.attributes.attribute);
                                    MntnerService.getAuthForObjectIfNeeded(parentObject, $scope.mntners.sso, 'Modify', sourceAttr.value.trim(), inetnumAttr.name, $scope.name).then(
                                        function () {
                                            doCreate(attributes, inetnumAttr.name);
                                        },
                                        function (error) {
                                            $scope.restCallInProgress = false;
                                            $log.error('MntnerService.getAuthForObjectIfNeeded rejected authorisation: ', error);
                                            AlertService.addGlobalError('Failed to authenticate parent resource');
                                        }
                                    );
                                }
                            }
                        }, function () {
                            // if we cannot find a parent, do not show the auth popup
                            doCreate(attributes, inetnumAttr.name);
                        });
                    }
                } else {
                    TextCommons.authenticate('Create', $scope.object.source, $scope.object.type, undefined, $scope.mntners.sso,
                        attributes, $scope.passwords, $scope.override).then(
                        function (authenticated) {
                            $log.debug('Authenticated successfully:' + authenticated);
                            // combine all passwords
                            doCreate(attributes, $scope.object.type);
                        }, function (authenticated) {
                            $log.error('Authentication failure:' + authenticated);
                        }
                    );
                }
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
