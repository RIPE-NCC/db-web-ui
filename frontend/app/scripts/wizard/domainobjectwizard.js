/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp').controller('DomainObjectController', ['$rootScope', '$http', '$scope', '$stateParams', '$location', '$anchorScroll', '$state', 'jsUtilService', 'AlertService', 'ModalService', 'RestService', 'AttributeMetadataService', 'WhoisResources', 'MntnerService', 'WebUpdatesCommons', 'CredentialsService', 'MessageStore', 'PrefixService', 'ErrorReporterService',
        function ($rootScope, $http, $scope, $stateParams, $location, $anchorScroll, $state, jsUtils, AlertService, ModalService, RestService, AttributeMetadataService, WhoisResources, MntnerService, WebUpdatesCommons, CredentialsService, MessageStore, PrefixService, ErrorReporterService) {

            // show splash screen
            ModalService.openDomainWizardSplash(function ($uibModalInstance) {
                var vm = this;
                vm.ok = function() {
                    $uibModalInstance.close('ok');
                };
            });

            var vm = this;
            /*
             * Initial scope vars
             */
            vm.maintainers = {
                sso: [],
                object: [],
                objectOriginal: [],
                alternatives: []
            };
            vm.restCallInProgress = false;
            vm.canSubmit = true;
            vm.canContinue = true;
            vm.isValidatingDomains = false;

            var objectType = vm.objectType = $stateParams.objectType === 'domain' ? 'prefix' : $stateParams.objectType;
            var source = vm.source = $stateParams.source;

            /*
             * Main
             */
            vm.attributes = AttributeMetadataService.determineAttributesForNewObject(objectType);

            vm.restCallInProgress = true;

            // should be the only thing to do, one day...
            AttributeMetadataService.enrich(objectType, vm.attributes);

            /*
             * Callback handlers
             */
            vm.submitButtonClicked = submitForm;

            vm.containsInvalidValues = function () {
                return containsInvalidValues(vm.attributes);
            };

            $scope.$on('attribute-state-changed', function () {
                AttributeMetadataService.enrich(objectType, vm.attributes);
            });

            $scope.$on('prefix-ok', _.debounce(onValidPrefix, 600));

            /*
             * Local functions
             */
            function onValidPrefix(event, prefixValue) {
                var revZonesAttr = _.find(vm.attributes, function (attr) {
                    return attr.name === 'reverse-zone';
                });
                revZonesAttr.value = PrefixService.getReverseDnsZones(prefixValue);

                MntnerService.getMntsToAuthenticateUsingParent(prefixValue, function (mntners) {

                    var mySsos = _.map(vm.maintainers.sso, 'key');

                    // NB don't use the stupid enrichWithSso call cz it's lame
                    var enriched = _.map(mntners, function (mntnerAttr) {
                        return {
                            type: 'mntner',
                            key: mntnerAttr.value,
                            mine: _.contains(mySsos, mntnerAttr.value)
                        };
                    });

                    RestService.detailsForMntners(enriched).then(function (enrichedMntners) {
                        vm.maintainers.objectOriginal = enrichedMntners;
                        if (MntnerService.needsPasswordAuthentication(vm.maintainers.sso, vm.maintainers.objectOriginal, vm.maintainers.object)) {
                            performAuthentication(vm.maintainers, function () {
                              var prefix = _.find(vm.attributes, {'name':'prefix'});
                                prefix.value = '';
                                prefix.$$invalid = true;
                                prefix.$$info = '';
                                AttributeMetadataService.clearLastPrefix();
                                $rootScope.$broadcast('attribute-state-changed');
                            });
                        }
                    });
                });
            }

            function containsInvalidValues(attributes) {
                var idx = _.findIndex(attributes, function (attr) {
                    return attr.$$invalid;
                });
                return idx !== -1;
            }

            function submitForm() {

                if (containsInvalidValues(vm.attributes)) {
                    return;
                }

                if (MntnerService.needsPasswordAuthentication(vm.maintainers.sso, vm.maintainers.objectOriginal, vm.maintainers.object)) {
                    performAuthentication(vm.maintainers, navigateAway);
                    return;
                }

                var flattenedAttributes = flattenStructure(vm.attributes);
                var passwords = CredentialsService.getPasswordsForRestCall();

                vm.restCallInProgress = true;
                vm.isValidatingDomains = true;

                // close the alert message
                vm.errors = [];

                var url = 'api/whois/domain-objects/' + vm.source;
                var data = {
                    type: objectType,
                    attributes: flattenedAttributes,
                    passwords: passwords
                };

                $http.post(url, data).then(function () {
                    ModalService.openDomainCreationModal(function ($uibModalInstance, $interval) {
                        var vm = this;
                        vm.done = 100;
                        // there's probably a better way to get the number of domains we'll create
                        vm.todo = _.filter(data.attributes, function(attr) {
                            return attr.name === 'reverse-zone';
                        }).length;

                        var backendPinger = $interval(function () {
                            PrefixService.getDomainCreationStatus(source).then(
                                function (response) {
                                    if (response.status === 200) {
                                        $interval.cancel(backendPinger);
                                        $uibModalInstance.close();
                                        return showCreatedDomains(response);
                                    } else if (response.status === 204) {
                                        // nothing happening in the backend
                                        $uibModalInstance.close();
                                        $interval.cancel(backendPinger);
                                    }
                                    // ok then just wait and keep on pinging...
                                }, function (failResponse) {
                                    $interval.cancel(backendPinger);
                                    $uibModalInstance.close();
                                    return createDomainsFailed(failResponse);
                                });
                        }, 2000);

                        vm.goAway = function () {
                            $interval.cancel(backendPinger);
                            $uibModalInstance.close();
                        };

                        vm.cancel = function () {
                            $interval.cancel(backendPinger);
                            $uibModalInstance.close();
                        };

                    });
                });

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

            function performAuthentication(maintainers, onNavigateAway) {
                var authParams = {
                    maintainers: maintainers,
                    operation: vm.operation,
                    object: {
                        source: vm.source,
                        type: objectType,
                        name: vm.name
                    },
                    isLirObject: false,
                    successClbk: onSuccessfulAuthentication,
                    failureClbk: onNavigateAway
                };
                WebUpdatesCommons.performAuthentication(authParams);
            }

            function showCreatedDomains(resp) {
                vm.restCallInProgress = false;
                vm.errors = [];
                vm.isValidatingDomains = false;
                var prefix = _.find(vm.attributes, function(attr) {
                    return attr.name === 'prefix';
                });
                AttributeMetadataService.resetDomainLookups(prefix.value);
                MessageStore.add('result', {prefix: prefix.value, whoisResources: resp.data});

                $state.transitionTo('webupdates.displayDomainObjects', {
                    source: vm.source,
                    objectType: vm.objectType
                });

            }

            function createDomainsFailed(response) {
                vm.restCallInProgress = false;
                vm.isValidatingDomains = false;
                vm.errors = _.filter(response.data.errormessages.errormessage,
                    function (errorMessage) {
                        errorMessage.plainText = readableError(errorMessage);
                        return errorMessage.severity === 'Error';
                    });

                if (!_.isEmpty(vm.errors)) {
                    ErrorReporterService.log('DomainWizard', 'domain', vm.errors);
                }

                $location.hash('errors');
                $anchorScroll();
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

            function onSuccessfulAuthentication(addedToSso) {
                var pk = addedToSso.data.objects.object[0]['primary-key'].attribute[0];
                if (pk) {
                    vm.attributes.push({name: 'mnt-by', value: pk.value});
                }
                $scope.$emit('maintainters-changed');
            }

            function navigateAway() {
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
