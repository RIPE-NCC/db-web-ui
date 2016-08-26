/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$scope', 'RestService', 'constants',
        function ($scope, RestService, constants) {

            var maintainerSso = [];

            /*
             * Initial scope vars
             */
            $scope.maintainers = {
                object: []
            };

            $scope.restCallInProgress = false;
            $scope.attributes = {};

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

            /*
             * Main
             */
            $scope.attributes = determineAttributesForNewObject('prefix');

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
             * Local functions
             */
            function determineAttributesForNewObject(objectType) {
                var i, attributes = [];
                console.log('constants.ObjectMetadata[objectType]', constants.ObjectMetadata[objectType]);
                _.forEach(constants.ObjectMetadata[objectType], function (val, key) {
                    if (val.minOccurs) {
                        for (i = 0; i < val.minOccurs; i++) {
                            attributes.push({name: key});
                        }
                    }
                });
                return attributes;
            }

        }]
    ).directive('attrInfo', ['WhoisResources', function (WhoisResources) {
            return {
                restrict: 'E',
                scope: {},
                template: '<span data-ng-bind-html="text"></span>',
                link: function (scope, element, attrs) {
                    if (!attrs.objectType) {
                        return;
                    }
                    if (attrs.description) {
                        scope.text = WhoisResources.getAttributeDescription(attrs.objectType, attrs.description);
                    } else if (attrs.syntax) {
                        scope.text = WhoisResources.getAttributeSyntax(attrs.objectType, attrs.syntax);
                    }
                }
            };
        }]
    ).controller('AttributeCtrl', ['$scope', 'constants',
        function ($scope, constants) {

            /*
             * Initial scope vars
             */
            $scope.isMntHelpShown = false;
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

            /*
             * Local functions
             */
            function canBeAdded(attributes, attribute) {
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
            controller: 'AttributeCtrl'
        };
    }]).directive('maintainers', [function () {
        return {
            restrict: 'E',
            templateUrl: 'scripts/wizard/maintainers.html'
        };
    }]).constant('constants', {
        ObjectMetadata: {
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
