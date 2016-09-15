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
    ).controller('AttributeCtrl', ['$scope', '$sce', 'AttributeMetadataService', 'WhoisMetaService', 'CharsetTools', 'RestService',
        function ($scope, $sce, AttributeMetadataService, WhoisMetaService, CharsetTools, RestService) {

            /*
             * $scope variables we can see because they're bound by our directive: attributeRenderer
             *
             * objectType : string   -- Can be 'organisation', 'inetnum', whatever....
             * attributes : object[] -- The array of attributes which make up the object.
             * attribute  : object   -- The attribute which this controller is responsible for.
             */

            /*
             * Initial scope vars
             */
            $scope.isMntHelpShown = false;
            if ($scope.attribute.name === 'source') {
                $scope.attribute.value = 'RIPE';
                if (!$scope.attribute.$$meta) {
                    $scope.attribute.$$meta = {};
                }
                $scope.attribute.$$meta.$$disable = true;
                $scope.attribute.$$invalid = false;
            }

            $scope.valueChanged = valueChanged;

            /*
             * Callback functions
             */
            $scope.canBeAdded = canBeAdded;

            $scope.canBeRemoved = canBeRemoved;

            $scope.referenceAutocomplete = referenceAutocomplete;

            $scope.duplicateAttribute = function (objectType, attributes, attribute) {
                if (canBeAdded(objectType, attributes, attribute)) {
                    var foundIdx = _.findIndex(attributes, function (attr) {
                        return attr.name === attribute.name && attr.value === attribute.value;
                    });
                    if (foundIdx > -1) {
                        attributes.splice(foundIdx + 1, 0, {name: attribute.name});
                    }
                }
            };

            $scope.removeAttribute = function (objectType, attributes, attribute) {
                if (canBeRemoved(objectType, attributes, attribute)) {
                    var foundIdx = _.findIndex(attributes, function (attr) {
                        return attr.name === attribute.name && attr.value === attribute.value;
                    });
                    if (foundIdx > -1) {
                        attributes.splice(foundIdx, 1);
                    }
                }
            };

            $scope.hasHelp = function (attribute) {
                return attribute.name !== 'reverse-zone';
            };

            $scope.getAttributeShortDescription = function (name) {
                return WhoisMetaService.getAttributeShortDescription($scope.objectType, name);
            };

            /*
             * Local functions
             */
            function valueChanged(objectType, attributes) {
                AttributeMetadataService.enrich(objectType, attributes);
            }

            function referenceAutocomplete(attribute, userInput) {
                var attrName = attribute.name;
                var refs = AttributeMetadataService.getMetadata($scope.objectType, $scope.attribute.name).refs;
                if (!refs) {
                    return [];
                }
                var utf8Substituted = warnForNonSubstitutableUtf8(attribute, userInput);
                if (utf8Substituted && isServerLookupKey(refs)) {
                    return RestService.autocompleteAdvanced(userInput, refs).then(
                        function (resp) {
                            return addNiceAutocompleteName(filterBasedOnAttr(resp, attrName), attrName);
                        },
                        function () {
                            // autocomplete error
                            return [];
                        });
                } else {
                    // No suggestions since not a reference
                    return [];
                }
            }

            function isServerLookupKey(refs) {
                return !(_.isUndefined(refs) || refs.length === 0 );
            }

            function warnForNonSubstitutableUtf8(attribute, userInput) {
                if (!CharsetTools.isLatin1(userInput)) {
                    // see if any chars can be substituted
                    var subbedValue = CharsetTools.replaceSubstitutables(userInput);
                    if (!CharsetTools.isLatin1(subbedValue)) {
                        attribute.$$error = 'Input contains illegal characters. These will be converted to \'?\'';
                        return false;
                    } else {
                        attribute.$$error = '';
                        return true;
                    }
                }
                return true;
            }

            function filterBasedOnAttr(suggestions, attrName) {
                return _.filter(suggestions, function (item) {
                    if (attrName === 'abuse-c') {
                        return !_.isEmpty(item['abuse-mailbox']);
                    }
                    return true;
                });
            }

            function addNiceAutocompleteName(items, attrName) {
                return _.map(items, function (item) {
                    var name = '';
                    var separator = ' / ';
                    if (item.type === 'person') {
                        name = item.person;
                    } else if (item.type === 'role') {
                        name = item.role;
                        if (attrName === 'abuse-c' && typeof item['abuse-mailbox'] === 'string') {
                            name = name.concat(separator + item['abuse-mailbox']);
                        }
                    } else if (item.type === 'aut-num') {
                        // When we're using an as-name then we'll need 1st descr as well (pivotal#116279723)
                        if (angular.isArray(item.descr) && item.descr.length) {
                            name = [item['as-name'], separator, item.descr[0]].join('');
                        } else {
                            name = item['as-name'];
                        }
                    } else if (typeof item['org-name'] === 'string') {
                        name = item['org-name'];
                    } else if (angular.isArray(item.descr)) {
                        name = item.descr.join('');
                    } else if (angular.isArray(item.owner)) {
                        name = item.owner.join('');
                    } else {
                        separator = '';
                    }
                    item.readableName = $sce.trustAsHtml((item.key + separator + name).replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                    return item;
                });
            }

            function canBeAdded(objectType, attributes, attribute) {
                if ($scope.attribute.name === 'reverse-zone') {
                    return false;
                }
                // count the attributes which match 'attribute'
                var cardinality = AttributeMetadataService.getCardinality($scope.objectType, attribute.name);

                if (cardinality.maxOccurs < 0) {
                    // undefined or -1 means no limit
                    return true;
                }
                // count attributes which match by name
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length < cardinality.maxOccurs;
            }

            function canBeRemoved(objectType, attributes, attribute) {
                var cardinality = AttributeMetadataService.getCardinality($scope.objectType, attribute.name);
                // check if there's a limit
                if (cardinality.minOccurs < 1) {
                    return true;
                }
                // count the attributes which match 'attribute' name
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length > cardinality.minOccurs;
            }
        }
    ]).directive('attributeRenderer', [function () {
        return {
            restrict: 'E',
            scope: {attributes: '=', attribute: '=', objectType: '=', idx: '='},
            templateUrl: 'scripts/wizard/attribute-renderer.html',
            controller: 'AttributeCtrl',
            link: function (scope) {
                // choose the html template dynamically
                if (scope.attribute.name === 'reverse-zone') {
                    scope.widgetHtml = 'scripts/wizard/attribute-reverse-zones.html';
                } else {
                    scope.widgetHtml = 'scripts/wizard/attribute.html';
                }
            }
        };
    }]);

})();
