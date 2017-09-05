/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').controller('AttributeCtrl', ['$scope', '$sce', 'AttributeMetadataService', 'WhoisMetaService',
        'CharsetTools', 'RestService', 'EnumService', 'ModalService',
        function ($scope, $sce, AttributeMetadataService, WhoisMetaService, CharsetTools, RestService, EnumService, ModalService) {

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

            $scope.canAddExtraAttributes = canAddExtraAttributes;

            $scope.canBeRemoved = canBeRemoved;

            $scope.autocompleteList = autocompleteList;
            $scope.staticList = staticList;
            $scope.displayEnumValue = displayEnumValue;

            $scope.isStaticList = function (objectType, attribute) {
                return AttributeMetadataService.getMetadata(objectType, attribute.name).staticList;
            };

            $scope.duplicateAttribute = function (objectType, attributes, attribute) {
                if (canBeAdded(objectType, attributes, attribute)) {
                    addAttr(attributes, attribute, attribute.name);
                }
            };

            $scope.displayAddAttributeDialog = function (objectType, attributes, attribute) {
                var addableAttributes = [];
                var md = AttributeMetadataService.getAllMetadata(objectType);
                for (var attributeName in md) {
                    if (md.hasOwnProperty(attributeName)) {
                        var metadata = AttributeMetadataService.getMetadata(objectType, attributeName);

                        if (!isReadOnly(metadata, objectType, attributes) && canBeAdded(objectType, attributes, { name: attributeName })) {
                            addableAttributes.push({name: attributeName});
                        }
                    }
                }

                ModalService.openAddAttributeModal(addableAttributes)
                    .then(function (selectedItem) {
                        addAttr(attributes, attribute, selectedItem.name);
                    });
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

            $scope.toggleHelp = function () {
                $scope.isHelpShown = !$scope.isHelpShown;
            };

            $scope.getAttributeShortDescription = function (name) {
                return WhoisMetaService.getAttributeShortDescription($scope.objectType, name);
            };

            $scope.attribute.isList = function () {
                return AttributeMetadataService.isList($scope.objectType, $scope.attribute);
            };

            /*
             * Local functions
             */

            function addAttr(attributes, attribute, attributeName) {
                var foundIdx = _.findIndex(attributes, function (attr) {
                    return attr.name === attribute.name && attr.value === attribute.value;
                });
                if (foundIdx > -1) {
                    attributes.splice(foundIdx + 1, 0, {name: attributeName});
                    AttributeMetadataService.enrich($scope.objectType, attributes);
                }
            }

            function valueChanged(objectType, attributes) {
                AttributeMetadataService.enrich(objectType, attributes);
            }

            function autocompleteList(objectType, attributes, attribute, userInput) {
                if (attribute.name === 'status') {
                    // special treatment of the status, it need to react on the changes in parent attribute
                    return statusAutoCompleteList(objectType, attributes, attribute, userInput);
                }
                var metadata = AttributeMetadataService.getMetadata(objectType, attribute.name);
                if (metadata.refs) {
                    return refsAutocomplete(attribute, userInput, metadata.refs);
                }
                return [];
            }

            function displayEnumValue(item) {
                if (item.key === item.value) {
                    return item.key;
                }
                return item.value + ' [' + item.key.toUpperCase() + ']';
            }

            function staticList(objectType, attribute) {
                var metadata = AttributeMetadataService.getMetadata(objectType, attribute.name);
                if (metadata.staticList) {
                    return EnumService.get($scope.objectType, attribute.name);
                }
                return [];
            }

            function refsAutocomplete(attribute, userInput, refs) {
                var utf8Substituted = warnForNonSubstitutableUtf8(attribute, userInput);
                if (utf8Substituted && isServerLookupKey(refs)) {
                    return RestService.autocompleteAdvanced(userInput, refs).then(
                        function (resp) {
                            return addNiceAutocompleteName(filterBasedOnAttr(resp, attribute.name), attribute.name);
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

            // special case of 'status' attribute
            $scope.attribute.$$statusOptionList = [];
            function statusAutoCompleteList(objectType, attributes, attribute, userInput) {
                // TODO Add all the parent-child stuff here
                $scope.attribute.$$statusOptionList = EnumService.get(objectType, attribute.name);
                return $scope.attribute.$$statusOptionList;
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

            function canAddExtraAttributes(objectType) {
                return objectType.toUpperCase() !== 'PREFIX';
            }

            function canBeAdded(objectType, attributes, attribute) {
                if (attribute.name === 'reverse-zone') {
                    return false;
                }
                // count the attributes which match 'attribute'
                var cardinality = AttributeMetadataService.getCardinality(objectType, attribute.name);

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

            function isReadOnly(metadata, objectType, attributes) {
                return typeof metadata.readOnly === 'function'?
                    metadata.readOnly(objectType, attributes) : metadata.readOnly;
            }

            function canBeRemoved(objectType, attributes, attribute) {
                var metadata = AttributeMetadataService.getMetadata(objectType, attribute.name);

                if (isReadOnly(metadata, objectType, attributes)) {
                    return false;
                }

                var cardinality = AttributeMetadataService.getCardinality(objectType, attribute.name);
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
    ]);

})();
