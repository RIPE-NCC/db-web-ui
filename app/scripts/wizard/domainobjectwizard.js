/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).controller('DomainObjectController', ['$http', '$rootScope', '$scope', '$stateParams', 'jsUtilService', 'AlertService', 'RestService', 'AttributeMetadataService', 'WhoisResources', 'MntnerService', 'WebUpdatesCommons', 'CredentialsService',
        function ($http, $rootScope, $scope, $stateParams, jsUtils, AlertService, RestService, AttributeMetadataService, WhoisResources, MntnerService, WebUpdatesCommons, CredentialsService) {

            //
            var fakeresp = {
                "link": {"type": "locator", "href": "http://hereford.prepdev.ripe.net:1080/domain-objects/RIPE"},
                "errorMessages": [{
                    "severity": "Error",
                    "text": "No name servers found at child.\n\nNo name servers could be found at the child. This usually means that the child is not configured to answer queries about the zone."
                }, {
                    "severity": "Error",
                    "text": "Fatal error in delegation for zone 32.33.33.in-addr.arpa.\n\nNo name servers found at child or at parent. No further testing can be performed."
                }, {
                    "severity": "Error",
                    "text": "No name servers found at child.\n\nNo name servers could be found at the child. This usually means that the child is not configured to answer queries about the zone."
                }, {
                    "severity": "Error",
                    "text": "Fatal error in delegation for zone 33.33.33.in-addr.arpa.\n\nNo name servers found at child or at parent. No further testing can be performed."
                }, {
                    "severity": "Error",
                    "text": "No name servers found at child.\n\nNo name servers could be found at the child. This usually means that the child is not configured to answer queries about the zone."
                }, {
                    "severity": "Error",
                    "text": "Fatal error in delegation for zone 34.33.33.in-addr.arpa.\n\nNo name servers found at child or at parent. No further testing can be performed."
                }, {
                    "severity": "Error",
                    "text": "No name servers found at child.\n\nNo name servers could be found at the child. This usually means that the child is not configured to answer queries about the zone."
                }, {"severity": "Error", "text": "Fatal error in delegation for zone 35.33.33.in-addr.arpa.\n\nNo name servers found at child or at parent. No further testing can be performed."}],
                "termsAndConditions": {"type": "locator", "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"},
                "whoisObjects": [{
                    "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/domain/32.33.33.in-addr.arpa"},
                    "source": {"id": "ripe"},
                    "primaryKey": [{"value": "32.33.33.in-addr.arpa", "name": "domain"}],
                    "attributes": [{"value": "32.33.33.in-addr.arpa", "name": "domain"}, {"value": "Reverse delegation for 33.33.33.0/22", "name": "descr"}, {
                        "value": "ns1.xs4all.nl",
                        "name": "nserver"
                    }, {"value": "ns2.xs4all.nl", "name": "nserver"}, {
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                        "value": "aa1-ripe",
                        "referencedType": "person",
                        "name": "admin-c"
                    }, {
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                        "value": "aa1-ripe",
                        "referencedType": "person",
                        "name": "tech-c"
                    }, {
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                        "value": "aa1-ripe",
                        "referencedType": "person",
                        "name": "zone-c"
                    }, {
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT"},
                        "value": "APPELBAUM-MNT",
                        "referencedType": "mntner",
                        "name": "mnt-by"
                    }, {
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"},
                        "value": "etchells-mnt",
                        "referencedType": "mntner",
                        "name": "mnt-by"
                    }, {"link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/xxx"}, "value": "xxx", "referencedType": "mntner", "name": "mnt-by"}, {
                        "value": "RIPE",
                        "name": "source"
                    }],
                    "type": "domain"
                }],
                "objects": {
                    "whoisObjects": [{
                        "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/domain/32.33.33.in-addr.arpa"},
                        "source": {"id": "ripe"},
                        "primaryKey": [{"value": "32.33.33.in-addr.arpa", "name": "domain"}],
                        "attributes": [{"value": "32.33.33.in-addr.arpa", "name": "domain"}, {"value": "Reverse delegation for 33.33.33.0/22", "name": "descr"}, {
                            "value": "ns1.xs4all.nl",
                            "name": "nserver"
                        }, {"value": "ns2.xs4all.nl", "name": "nserver"}, {
                            "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                            "value": "aa1-ripe",
                            "referencedType": "person",
                            "name": "admin-c"
                        }, {
                            "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                            "value": "aa1-ripe",
                            "referencedType": "person",
                            "name": "tech-c"
                        }, {
                            "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/person/aa1-ripe"},
                            "value": "aa1-ripe",
                            "referencedType": "person",
                            "name": "zone-c"
                        }, {
                            "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT"},
                            "value": "APPELBAUM-MNT",
                            "referencedType": "mntner",
                            "name": "mnt-by"
                        }, {
                            "link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"},
                            "value": "etchells-mnt",
                            "referencedType": "mntner",
                            "name": "mnt-by"
                        }, {"link": {"type": "locator", "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/xxx"}, "value": "xxx", "referencedType": "mntner", "name": "mnt-by"}, {
                            "value": "RIPE",
                            "name": "source"
                        }],
                        "type": "domain"
                    }]
                }
            };
            //$scope.errors = fakeresp.errorMessages;
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
                    performAuthentication();
                    return;
                }

                var passwords = getPasswordsForRestCall();

                $scope.restCallInProgress = true;

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

            function performAuthentication() {
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
                $scope.successMessages = [{text:'domains created'}];
                WebUpdatesCommons.navigateToDisplay($scope.source, $scope.objectType, resp.getPrimaryKey(), $scope.operation);
            }

            function onSubmitError(response) {
                $scope.restCallInProgress = false;
                $scope.errors = _.filter(response.data.errorMessages,
                    function (errorMessage) {
                        errorMessage.plainText = readableError(errorMessage);
                        return errorMessage.severity === 'Error';
                    });
                console.log('$scope.errors', $scope.errors);
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

            function getPasswordsForRestCall() {
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
