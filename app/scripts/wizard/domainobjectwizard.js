/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').controller('DomainObjectController',
        ['$scope', 'RestService', 'constants', function ($scope, RestService, constants) {

            var maintainerSso = [];

            $scope.maintainers = {
                object: []
            };

            $scope.attributes = [{
                name: 'prefix'
            }, {
                name: 'descr'
            }, {
                name: 'nserver'
            }, {
                name: 'nserver'
            }];

            $scope.restCallInProgress = false;

            $scope.restCallInProgress = true;
            RestService.fetchMntnersForSSOAccount().then(
                function (results) {
                    var mntner;
                    for (var i = 0; i < results.length; i++) {
                        mntner = results[i];
                        mntner.$$isMine = true;
                        mntner.$$hasSso = true;
                        maintainerSso.push(mntner);
                    }
                    $scope.maintainers.object = _.cloneDeep(maintainerSso);
                    $scope.message = {};
                }, function (error) {
                    $scope.restCallInProgress = false;
                    console.log('Error fetching mntners for SSO:' + JSON.stringify(error));
                    $scope.message = {
                        type: 'error',
                        text: 'Error fetching maintainers associated with this SSO account'
                    };
                });

            /*
             * Callback functions
             */
            $scope.canBeAdded = function (objectType, attributes, attribute) {
                // count the attributes which match 'attribute'
                var attrMetadata = constants.ObjectMetadata[objectType][attribute.name];
                if (attrMetadata.maxOccurs < 0) {
                    console.log('canBeAdded is true');
                    return true;
                }
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length < attrMetadata.maxOccurs;
            };

            $scope.canBeRemoved = function (objectType, attributes, attribute) {
                // count the attributes which match 'attribute'
                var attrMetadata = constants.ObjectMetadata[objectType][attribute.name];
                if (!attrMetadata.minOccurs) {
                    return true;
                }
                var matches = _.filter(attributes, function (attr) {
                    return attr.name === attribute.name;
                });
                return matches.length > attrMetadata.minOccurs;
            };

            $scope.getAttributeShortDescription = function() {};
        }]
    ).directive('attrInfo', ['WhoisResources', function (WhoisResources) {
            return {
                restrict: 'E',
                scope: {},
                template: '<span ng-bind-html="text"></span>',
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
    ).constant('constants', {
        ObjectMetadata: {
            domain: {
                domain: {minOccurs: 1, maxOccurs: 1, primaryKey: true, refs: []},
                descr: {minOccurs: 0, maxOccurs: -1, refs: []},
                org: {minOccurs: 0, maxOccurs: -1, refs: ['ORGANISATION']},
                'admin-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                'tech-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                'zone-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                nserver: {minOccurs: 2, maxOccurs: -1, refs: []},
                'ds-rdata': {minOccurs: 0, maxOccurs: -1, refs: []},
                remarks: {minOccurs: 0, maxOccurs: -1, refs: []},
                notify: {minOccurs: 0, maxOccurs: -1, refs: []},
                'mnt-by': {minOccurs: 1, maxOccurs: -1, refs: ['MNTNER']},
                created: {minOccurs: 0, maxOccurs: 1, refs: []},
                'last-modified': {minOccurs: 0, maxOccurs: 1, refs: []},
                source: {minOccurs: 1, maxOccurs: 1, refs: []}
            },
            prefix: {
                prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true, refs: []},
                descr: {minOccurs: 0, maxOccurs: -1, refs: []},
                org: {minOccurs: 0, maxOccurs: -1, refs: ['ORGANISATION']},
                'admin-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                'tech-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                'zone-c': {minOccurs: 1, maxOccurs: -1, refs: ['PERSON', 'ROLE']},
                nserver: {minOccurs: 2, maxOccurs: -1, refs: []},
                'ds-rdata': {minOccurs: 0, maxOccurs: -1, refs: []},
                remarks: {minOccurs: 0, maxOccurs: -1, refs: []},
                notify: {minOccurs: 0, maxOccurs: -1, refs: []},
                'mnt-by': {minOccurs: 1, maxOccurs: -1, refs: ['MNTNER']},
                created: {minOccurs: 0, maxOccurs: 1, refs: []},
                'last-modified': {minOccurs: 0, maxOccurs: 1, refs: []},
                source: {minOccurs: 1, maxOccurs: 1, refs: []}
            }
        }
    });

})();
