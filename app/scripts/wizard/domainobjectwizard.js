/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$scope', 'RestService', 'constants',
        function ($scope, RestService, constants) {

            var maintainerSso = [];
            var objectType = 'prefix';

            /*
             * Initial scope vars
             */
            $scope.maintainers = {
                object: []
            };

            $scope.restCallInProgress = false;
            $scope.attributes = {};

            /*
             * Main
             */
            $scope.attributes = determineAttributesForNewObject(objectType);

            $scope.restCallInProgress = true;
            RestService.fetchMntnersForSSOAccount().then(
                function (results) {
                    var mntner;
                    for (var i = 0; i < results.length; i++) {
                        mntner = results[i];
                        maintainerSso.push(mntner);
                    }
                    $scope.maintainers.object = _.cloneDeep(maintainerSso);
                    $scope.message = {};
                    $scope.restCallInProgress = false;
                }, function (error) {
                    console.log('Error fetching mntners for SSO:' + JSON.stringify(error));
                    $scope.message = {
                        type: 'error',
                        text: 'Error fetching maintainers associated with this SSO account'
                    };
                    $scope.restCallInProgress = false;
                }
            );

            /*
             * Callback handlers
             */
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

            $scope.showAttribute = function(attribute) {
                var attrMetadata = constants.ObjectMetadata[objectType][attribute.name];
                if (attrMetadata.primaryKey) {
                    return true;
                } else if (attribute.name === 'reverse-zones') {
                    // ok if prefix is valid
                    return _.find($scope.attributes, function(o) {
                        return (o.name === 'prefix') && isValidPrefix(o.value);
                    });
                } else {
                    // if primary key has a value, then show all others
                    var pkName = _.findKey(constants.ObjectMetadata[objectType], function(o) {
                        return o.primaryKey;
                    });
                    return _.find($scope.attributes, function(o) {
                        return (o.name === pkName) && o.value;
                    });
                }
            };

            /*
             * Local functions
             */
            function determineAttributesForNewObject(objectType) {
                var i, attributes = [];
                _.forEach(constants.ObjectMetadata[objectType], function (val, key) {
                    if (val.minOccurs) {
                        for (i = 0; i < val.minOccurs; i++) {
                            attributes.push({name: key});
                        }
                    }
                });
                return attributes;
            }

            var prefixRe = /([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,3}/;
            function isValidPrefix(prefix) {
                return prefixRe.test(prefix);
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
    ).controller('AttributeCtrl', ['$scope', 'constants', 'WhoisMetaService',
        function ($scope, constants, WhoisMetaService) {

            var isReverseZones = $scope.attribute.name === 'reverse-zones';

            /*
             * Initial scope vars
             */
            $scope.isMntHelpShown = false;
            if (isReverseZones) {
                // $scope.reverseZones = [{
                //     name: '42.23.194.in-addr.arpa'
                // }, {
                //     name: '43.23.194.in-addr.arpa'
                // }];
            }

            // should we even show this attribute?
            $scope.showAttribute = false;
            // var attrMetadata = constants.ObjectMetadata[$scope.objectType][$scope.attribute.name];
            // if (!attrMetadata) {
            // }

            /*
             * Callback functions
             */
            $scope.canBeAdded = canBeAdded;

            $scope.canBeRemoved = canBeRemoved;

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
            function canBeAdded(attributes, attribute) {
                if (isReverseZones) {
                    return false;
                }
                // count the attributes which match 'attribute'
                var attrMetadata = constants.ObjectMetadata[$scope.objectType][attribute.name];
                if (!attrMetadata) {
                    return;
                }
                if (typeof attrMetadata.maxOccurs === 'undefined' || attrMetadata.maxOccurs < 0) {
                    // undefined or -1 means no limit
                    return true;
                }
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length < attrMetadata.maxOccurs;
            }

            function canBeRemoved(attributes, attribute) {
                if (isReverseZones) {
                    return false;
                }
                // count the attributes which match 'attribute'
                var attrMetadata = constants.ObjectMetadata[$scope.objectType][attribute.name];
                if (!attrMetadata.minOccurs) {
                    return true;
                }
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length > attrMetadata.minOccurs;
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
    }]).constant('constants', {
        ObjectMetadata: {
            // minOccurs default: 0
            // maxOccurs default: -1 (which means 'no maximum')
            domain: {
                domain: {minOccurs: 1, maxOccurs: 1, primaryKey: true},
                descr: {minOccurs: 0, maxOccurs: -1},
                org: {minOccurs: 0, maxOccurs: -1},
                'admin-c': {minOccurs: 1, maxOccurs: -1},
                'tech-c': {minOccurs: 1, maxOccurs: -1},
                'zone-c': {minOccurs: 1, maxOccurs: -1},
                nserver: {minOccurs: 2, maxOccurs: -1},
                'ds-rdata': {minOccurs: 0, maxOccurs: -1},
                remarks: {minOccurs: 0, maxOccurs: -1},
                notify: {minOccurs: 0, maxOccurs: -1},
                'mnt-by': {minOccurs: 1, maxOccurs: -1},
                created: {minOccurs: 0, maxOccurs: 1},
                'last-modified': {minOccurs: 0, maxOccurs: 1},
                source: {minOccurs: 1, maxOccurs: 1}
            },
            prefix: {
                prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true},
                descr: {minOccurs: 0, maxOccurs: -1},
                nserver: {minOccurs: 2, maxOccurs: -1},
                'reverse-zones': {minOccurs: 1, maxOccurs: 1},
                'ds-rdata': {minOccurs: 0, maxOccurs: -1},
                org: {minOccurs: 0, maxOccurs: -1},
                'admin-c': {minOccurs: 1, maxOccurs: -1},
                'tech-c': {minOccurs: 1, maxOccurs: -1},
                'zone-c': {minOccurs: 1, maxOccurs: -1},
                remarks: {minOccurs: 0, maxOccurs: -1},
                notify: {minOccurs: 0, maxOccurs: -1},
                'mnt-by': {minOccurs: 1, maxOccurs: -1},
                created: {minOccurs: 0, maxOccurs: 1},
                'last-modified': {minOccurs: 0, maxOccurs: 1},
                source: {minOccurs: 1, maxOccurs: 1}
            }
        }
    });

})();
