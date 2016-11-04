/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$http', '$scope', '$stateParams',  '$state', 'jsUtilService', 'AlertService', 'RestService', 'AttributeMetadataService', 'WhoisResources', 'MntnerService', 'WebUpdatesCommons', 'CredentialsService', 'MessageStore','PrefixService',
        function ($http, $scope, $stateParams, $state, jsUtils, AlertService, RestService, AttributeMetadataService, WhoisResources, MntnerService, WebUpdatesCommons, CredentialsService, MessageStore, PrefixService) {

            /*
             * Initial scope vars
             */
            $scope.maintainers = {
                sso: [],
                object: [],
                objectOriginal: [],
                alternatives: []
            };
            $scope.restCallInProgress = false;
            $scope.canSubmit = true;
            $scope.canContinue = true;
            $scope.isValidatingDomains = false;

            var objectType = $scope.objectType = $stateParams.objectType === 'domain' ? 'prefix' : $stateParams.objectType;
            $scope.source = $stateParams.source;

            /*
             * Main
             */
            $scope.attributes = determineAttributesForNewObject(objectType);

            $scope.restCallInProgress = true;

            $scope.maintainers.objectOriginal = [];//_extractEnrichMntnersFromObject($scope.attributes, $scope.maintainers.sso);


            // should be the only thing to do, one day...
            AttributeMetadataService.enrich(objectType, $scope.attributes);

            /*
             * Callback handlers
             */
            $scope.submitButtonClicked = submitButtonHandler;

            $scope.containsInvalidValues = function () {
                return containsInvalidValues($scope.attributes);
            };

            $scope.$on('attribute-state-changed', function () {
                AttributeMetadataService.enrich(objectType, $scope.attributes);
            });

            $scope.$on('prefix-ok', function(event, prefixValue) {
                var revZonesAttr = _.find($scope.attributes, function (attr) {
                    return attr.name === 'reverse-zone';
                });
                revZonesAttr.value = PrefixService.getReverseDnsZones(prefixValue);

                var mntners = MntnerService.getMntsToAuthenticateUsingParent(prefixValue);

                console.log('*********************');
                console.log('*********************');
                console.log('*********************');
                console.log(JSON.stringify(mntners));
                console.log('*********************');
                console.log('*********************');
                console.log('*********************');

            });

            /*
             * Local functions
             */
            function containsInvalidValues(attributes) {
                var idx = _.findIndex(attributes, function (attr) {
                    return attr.$$invalid;
                });
                return idx !== -1;
            }

            function determineAttributesForNewObject(objectType) {
                var i, attributes = [];
                _.forEach(AttributeMetadataService.getAllMetadata(objectType), function (val, key) {
                    if (val.minOccurs) {
                        for (i = 0; i < val.minOccurs; i++) {
                            attributes.push({name: key, value: ''});
                        }
                    }
                });
                return attributes;
            }

            function submitButtonHandler() {

                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    performAuthentication();
                    return;
                }

                var flattenedAttributes = flattenStructure($scope.attributes);
                var passwords = CredentialsService.getPasswordsForRestCall();

                $scope.restCallInProgress = true;
                $scope.isValidatingDomains = true;

                // close the alert message
                $scope.errors = [];

                var url = 'api/whois/domain-objects/' + $scope.source;
                var data = {
                    type: objectType,
                    attributes: flattenedAttributes,
                    passwords: passwords
                };
                $http.post(url, data).then(onSubmitSuccess, onSubmitError);
            }

            function flattenStructure(attributes) {
                var flattenedAttributes = [];
                _.forEach(attributes, function (attr) {
                    if (jsUtils.typeOf(attr.value) === 'array') {
                        _.forEach(attr.value, function (atr) {
                            flattenedAttributes.push({name: atr.name, value: atr.value || ''});
                        });
                    } else {
                        flattenedAttributes.push({name: attr.name, value: attr.value || ''});
                    }
                });
                return flattenedAttributes;
            }

            function performAuthentication(mnts) {
                var authParams = {
                    maintainers: $scope.maintainers,
                    operation: $scope.operation,
                    object: {
                        source: $scope.source,
                        type: objectType,
                        name: $scope.name
                    },
                    isLirObject: false,
                    successClbk: onSuccessfulAuthentication,
                    failureClbk: navigateAway
                };
                WebUpdatesCommons.performAuthentication(authParams);
            }

            function onSubmitSuccess(resp) {
                $scope.restCallInProgress = false;
                $scope.errors = [];
                $scope.isValidatingDomains = false;
                console.log('onSubmitSuccess resp', resp);

                var prefix = _.find($scope.attributes, function(attr) {
                    return attr.name === 'prefix';
                });

                MessageStore.add('result', {prefix: prefix.value, whoisResources: resp.data});

                $state.transitionTo('webupdates.displayDomainObjects', {
                    source: $scope.source,
                    objectType: $scope.objectType
                });

            }

            function onSubmitError(response) {
                $scope.restCallInProgress = false;
                $scope.isValidatingDomains = false;
                $scope.errors = _.filter(response.data.errormessages.errormessage,
                    function (errorMessage) {
                        errorMessage.plainText = readableError(errorMessage);
                        return errorMessage.severity === 'Error';
                    });
            }

            var readableError = function (errorMessage) {
                var idx = 0;
                return errorMessage.text.replace(/%s/g, function (match) {
                    if (errorMessage.args.length - 1 >= idx) {
                        var arg = errorMessage.args[idx].value;
                        idx++;
                        return arg;
                    } else {
                        return match;
                    }
                });
            };

            function onSuccessfulAuthentication() {
                console.log('_onSuccessfulAuthentication');
            }

            function navigateAway() {
                console.log('_navigateAway');
            }

        }]
    ).directive('attrInfo', ['WhoisMetaService', function (WhoisMetaService) {
            return {
                restrict: 'E',
                scope: {},
                template: '<span data-ng-bind-html="text"></span>',
                link: function (scope, element, attrs) {
                    if (!attrs.objectType) {
                        return;
                    }
                    if (attrs.description) {
                        scope.text = WhoisMetaService.getAttributeDescription(attrs.objectType, attrs.description);
                    } else if (attrs.syntax) {
                        scope.text = WhoisMetaService.getAttributeSyntax(attrs.objectType, attrs.syntax);
                    }
                }
            };
        }]
    );

})();
