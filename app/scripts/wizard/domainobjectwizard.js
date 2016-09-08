/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$scope', 'jsUtilService', 'RestService', 'AttributeMetadataService', 'WhoisResources', 'MntnerService', 'WebUpdatesCommons', 'CredentialsService',
        function ($scope, jsUtils, RestService, AttributeMetadataService, WhoisResources, MntnerService, WebUpdatesCommons, CredentialsService) {

            var objectType = 'prefix';

            /*
             * Initial scope vars
             */
            $scope.maintainers = {
                sso: [],
                object: [],
                objectOriginal: []
            };

            $scope.restCallInProgress = false;
            $scope.attributes = [];

            /*
             * Main
             */
            $scope.attributes = determineAttributesForNewObject(objectType);

            $scope.restCallInProgress = true;
            RestService.fetchMntnersForSSOAccount().then(
                function (results) {
                    var attributes;
                    $scope.restCallInProgress = false;
                    $scope.maintainers.sso = results;
                    if ($scope.maintainers.sso.length > 0) {

                        $scope.maintainers.objectOriginal = [];
                        // populate ui-select box with sso-mntners
                        $scope.maintainers.object = _.cloneDeep($scope.maintainers.sso);

                        // copy mntners to attributes (for later submit)
                        var mntnerAttrs = _.map($scope.maintainers.sso, function (i) {
                            return {name: 'mnt-by', value: i.key};
                        });

                        attributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType,
                            $scope.attributes.addAttrsSorted('mnt-by', mntnerAttrs));

                        // Post-process atttributes before showing using screen-logic-interceptor
                        $scope.attributes = attributes;

                        console.log('mntners-sso:' + JSON.stringify($scope.maintainers.sso));
                        console.log('mntners-object-original:' + JSON.stringify($scope.maintainers.objectOriginal));
                        console.log('mntners-object:' + JSON.stringify($scope.maintainers.object));
                        _extractEnrichMntnersFromObject($scope.attributes, $scope.maintainers.sso);

                    } else {
                        attributes = $scope.attributes;
                        //$scope.attributes = _interceptBeforeEdit($scope.CREATE_OPERATION, attributes);
                    }
                }, function (error) {

                    $scope.restCallInProgress = false;

                    console.log('Error fetching mntners for SSO:' + JSON.stringify(error));
                    $scope.message = {
                        type: 'error',
                        text: 'Error fetching maintainers associated with this SSO account'
                    };
                }
            );

            $scope.maintainers.objectOriginal = [];//_extractEnrichMntnersFromObject($scope.attributes, $scope.maintainers.sso);

            function _extractEnrichMntnersFromObject(attributes, maintainersSso) {
                // get mntners from response
                var mntnersInObject = _.filter(attributes, function (attr) {
                    return attr.name === 'mnt-by';
                });

                // determine if mntner is mine
                var selected = _.map(mntnersInObject, function (mntnerAttr) {
                    return {
                        type: 'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map(maintainersSso, 'key'), mntnerAttr.value)
                    };
                });

                return selected;
            }

            // should be the only thing to do, one day...
            AttributeMetadataService.enrich(objectType, $scope.attributes);

            /*
             * Callback handlers
             */
            $scope.submitButtonClicked = submitButtonHandler();

            $scope.cancel = function () {
                console.log('cancel button was clicked');
            };

            $scope.isModifyWithSingleMntnerRemaining = function () {
                // ...from createModifyController...
                // return $scope.operation === 'Modify' && $scope.maintainers.object.length === 1;
                return false;
            };

            $scope.onMntnerAdded = function (item, model) {
                console.log('onMntnerAdded', item, model);
            };

            $scope.onMntnerRemoved = function (item, model) {
                console.log('onMntnerRemoved', item, model);
            };

            $scope.showAttribute = function (attribute) {
                return !AttributeMetadataService.isHidden('prefix', $scope.attributes, attribute);
            };

            /*
             * Local functions
             */

            function determineAttributesForNewObject(objectType) {
                var i, attributes = [];
                _.forEach(AttributeMetadataService.getAllMetadata(objectType), function (val, key) {
                    if (val.minOccurs) {
                        for (i = 0; i < val.minOccurs; i++) {
                            attributes.push({name: key});
                        }
                    }
                });
                return attributes;
            }

            function submitButtonHandler() {

                var whoisAttributes;

                _.forEach($scope.attributes, function(attr) {
                    if (!attr.name) {
                        attr.name = '';
                    }
                });

                console.log('$scope.attributes', $scope.attributes);
                //TODO: check form is valid
                //     ErrorReporterService.log($scope.operation, $scope.objectType, AlertService.getErrors(), $scope.attributes);

                $scope.restCallInProgress = true;

                function _onSubmitSuccess(resp) {
                    $scope.restCallInProgress = false;
                    console.log(resp);
                }

                function _onSubmitError(resp) {
                    $scope.restCallInProgress = false;
                    console.log(resp);
                }

                whoisAttributes = WhoisResources.wrapAndEnrichAttributes($scope.objectType, $scope.attributes);

                //AlertService.clearErrors();
                console.log('$scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object', $scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object);

                if (MntnerService.needsPasswordAuthentication($scope.maintainers.sso, $scope.maintainers.objectOriginal, $scope.maintainers.object)) {
                    _performAuthentication();
                    return;
                }

                var passwords = _getPasswordsForRestCall();

                $scope.restCallInProgress = true;

                if (!$scope.name) {

                    RestService.createObject('RIPE', $scope.objectType,
                        WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), passwords).then(
                        _onSubmitSuccess,
                        _onSubmitError);

                } else {
                    //TODO: Temporary function till RPSL clean up
                    if (MntnerService.isLoneRpslMntner($scope.maintainers.objectOriginal)) {
                        passwords.push('RPSL');
                    }

                    RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                        WhoisResources.turnAttrsIntoWhoisObject($scope.attributes), passwords).then(
                        _onSubmitSuccess,
                        _onSubmitError);
                }
                //}
            }

            function _performAuthentication() {
                console.log('XXX $scope.maintainers', $scope.maintainers);
                var authParams = {
                    maintainers: $scope.maintainers,
                    operation: $scope.operation,
                    object: {
                        source: $scope.source,
                        type: $scope.objectType,
                        name: $scope.name
                    },
                    isLirObject: false,
                    successClbk: _onSuccessfulAuthentication,
                    failureClbk: _navigateAway
                };
                WebUpdatesCommons.performAuthentication(authParams);
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
            }
            $scope.value = $scope.attribute.value;

            $scope.valueConfirmed = valueConfirmed;
            $scope.valueChanged = valueChanged;

            /*
             * Callback functions
             */

            $scope.canBeAdded = canBeAdded;

            $scope.canBeRemoved = canBeRemoved;

            $scope.referenceAutocomplete = referenceAutocomplete;

            $scope.duplicateAttribute = function (attributes, attribute) {
                if (canBeAdded(attributes, attribute)) {
                    var foundIdx = _.findIndex(attributes, function (attr) {
                        return attr.name === attribute.name && attr.value === attribute.value;
                    });
                    if (foundIdx > -1) {
                        attributes.splice(foundIdx + 1, 0, {name: attribute.name});
                    }
                }
            };

            $scope.removeAttribute = function (attributes, attribute) {
                if (canBeRemoved(attributes, attribute)) {
                    var foundIdx = _.findIndex(attributes, function (attr) {
                        return attr.name === attribute.name && attr.value === attribute.value;
                    });
                    if (foundIdx > -1) {
                        attributes.splice(foundIdx, 1);
                    }
                }
            };

            $scope.hasHelp = function (attribute) {
                return attribute.name !== 'reverse-zones';
            };

            $scope.getAttributeShortDescription = function (name) {
                return WhoisMetaService.getAttributeShortDescription($scope.objectType, name);
            };

            /*
             * Local functions
             */

            function valueConfirmed(attribute, newVal, event) {
                if (event && event.keyCode !== 13) {
                    return;
                }
                attribute.value = newVal;
                AttributeMetadataService.enrich($scope.objectType, $scope.attributes);
            }

            function valueChanged(attribute, newVal) {
                attribute.value = newVal;
                attribute.$$invalid = AttributeMetadataService.isInvalid($scope.objectType, $scope.attributes, attribute);
            }

            function referenceAutocomplete(attribute, userInput) {
                var attrName = attribute.name;
                var refs = AttributeMetadataService.getReferences($scope.objectType, $scope.attribute.name);
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

            function canBeAdded(attributes, attribute) {
                if ($scope.attribute.name === 'reverse-zones') {
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

            function canBeRemoved(attributes, attribute) {
                if ($scope.attribute.name === 'reverse-zones') {
                    return false;
                }
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
            scope: {attributes: '=', attribute: '=', objectType: '='},
            templateUrl: 'scripts/wizard/attribute-renderer.html',
            controller: 'AttributeCtrl',
            link: function (scope) {
                // choose the html template dynamically
                if (scope.attribute.name === 'reverse-zones') {
                    scope.widgetHtml = 'scripts/wizard/attribute-reverse-zones.html';
                } else {
                    scope.widgetHtml = 'scripts/wizard/attribute.html';
                }
            }
        };
    }]).directive('maintainers', [function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/wizard/maintainers.html'
        };
    }]);

})();
