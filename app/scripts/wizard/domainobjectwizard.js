/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$http', '$scope', '$stateParams', 'jsUtilService', 'RestService', 'AttributeMetadataService', 'WhoisResources', 'MntnerService', 'WebUpdatesCommons', 'CredentialsService',
        function ($http, $scope, $stateParams, jsUtils, RestService, AttributeMetadataService, WhoisResources, MntnerService, WebUpdatesCommons, CredentialsService) {

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
            //$scope.objectType = objectType;
            $scope.canSubmit = true;
            $scope.canContinue = true;

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

            $scope.cancel = function () {
                console.log('cancel button was clicked');
            };

            $scope.$on('attribute-state-changed', function () {
                AttributeMetadataService.enrich($scope.objectType, $scope.attributes);
            });

            /*
             * Local functions
             */
            function containsInvalidValues(attributes) {
                console.log('whoisObjectForm', $scope.whoisObjectForm);
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

                var flattenedAttributes = flattenStructure($scope.attributes);

                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    _performAuthentication();
                    return;
                }

                var passwords = _getPasswordsForRestCall();

                $scope.restCallInProgress = true;

                var url = 'api/whois/domain-objects/TEST';
                var data = {
                    type: objectType,
                    attributes: flattenedAttributes,
                    passwords: passwords
                };
                $http.post(url, data).then(_onSubmitSuccess, _onSubmitError);
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

            function _performAuthentication() {
                var authParams = {
                    maintainers: $scope.maintainers,
                    operation: $scope.operation,
                    object: {
                        source: $scope.source,
                        type: objectType,
                        name: $scope.name
                    },
                    isLirObject: false,
                    successClbk: _onSuccessfulAuthentication,
                    failureClbk: _navigateAway
                };
                WebUpdatesCommons.performAuthentication(authParams);
            }

            function _onSubmitSuccess(resp) {
                $scope.restCallInProgress = false;
                WebUpdatesCommons.navigateToDisplay($scope.source, $scope.objectType, resp.getPrimaryKey(), $scope.operation);
            }

            function _onSubmitError() {
                $scope.restCallInProgress = false;
            }

            function _onSuccessfulAuthentication() {
                console.log('_onSuccessfulAuthentication');
            }

            function _navigateAway() {
                console.log('_navigateAway');
            }

            function _getPasswordsForRestCall() {
                var passwords = [];

                if (CredentialsService.hasCredentials()) {
                    passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                /*
                 * For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
                 * This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
                 */
                if ($scope.objectType === 'route' || $scope.objectType === 'route6' || $scope.objectType === 'aut-num') {
                    passwords.push('RPSL');
                }
                return passwords;
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
