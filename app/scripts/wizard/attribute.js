/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
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
            $scope.isHelpShown = false;
            $scope.isMntHelpShown = false;
            if ($scope.attribute.name === 'source') {
                $scope.attribute.value = $scope.source;
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
                        AttributeMetadataService.enrich(objectType, attributes);
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
                        AttributeMetadataService.enrich(objectType, attributes);
                    }
                }
            };

            $scope.toggleHelp = function() {
                $scope.isHelpShown = !$scope.isHelpShown;
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
            scope: {attributes: '=', attribute: '=', objectType: '=', source: '=', idx: '='},
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
