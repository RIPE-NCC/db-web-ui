'use strict';

angular.module('textUpdates')
    .controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', '$q',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService', 'MessageStore',
        'RpslService', 'MntnerService', 'ModalService', 'CredentialsService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore,
                  RpslService, MntnerService, ModalService, CredentialsService) {


            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                $cookies.put('ui-mode', 'textupdates');

                // extract parameters from the url
                $scope.object = {}
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;

                // maintainers associated with this SSO-account
                $scope.mntners = {}
                $scope.mntners.sso = [];

                $log.debug('TextCreateController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type);

                _prepopulateRpsl();
            };

            function _prepopulateRpsl() {
                var attributesOnObjectType = WhoisResources.getAllAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(attributesOnObjectType)) {
                    $state.transitionTo('notFound');
                    return
                }

                _enrichAttributes(
                    WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributesOnObjectType)
                );
            }

            function _enrichAttributes(attributes) {

                _enrichWithDefaults(attributes);

                _enrichAttributesWithSsoMntners(attributes).then(
                    function (attributes) {
                        _capitaliseMandatory(attributes);
                        $scope.object.rpsl = RpslService.toRpsl(attributes);
                    }
                );

                return attributes;
            }

            function _enrichWithDefaults(attributes) {
                // This does only add value if attribute exist
                attributes.setSingleAttributeOnName('source', $scope.object.source);
                attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                attributes.setSingleAttributeOnName('org-type', 'OTHER'); // other org-types only settable with override
            }

            function _enrichAttributesWithSsoMntners(attributes) {
                var deferredObject = $q.defer();

                $scope.restCalInProgress = true;
                RestService.fetchMntnersForSSOAccount().then(
                    function (ssoMntners) {
                        $scope.restCalInProgress = false;

                        $scope.mntners.sso = ssoMntners;

                        var enrichedAttrs = _addSsoMntnersAsMntBy(attributes, ssoMntners);
                        deferredObject.resolve(enrichedAttrs);

                    }, function (error) {
                        $scope.restCalInProgress = false;

                        $log.error('Error fetching mntners for SSO:' + JSON.stringify(error));
                        AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        deferredObject.resolve(attributes);
                    }
                );

                return deferredObject.promise;
            }

            function _addSsoMntnersAsMntBy(attributes, mntners) {
                // keep existing
                if (mntners.length === 0) {
                    return attributes;
                }

                // merge mntners into json-attributes
                var mntnersAsAttrs = _.map(mntners, function (item) {
                    return {name: 'mnt-by', value: item.key};
                });
                var attrsWithMntners = attributes.addAttrsSorted('mnt-by', mntnersAsAttrs);

                // strip mnt-by without value from attributes
                return _.filter(attrsWithMntners, function (item) {
                    return !(item.name === 'mnt-by' && _.isUndefined(item.value));
                });
            }

            function _capitaliseMandatory(attributes) {
                _.each(attributes, function (attr) {
                    if (attr.$$meta.$$mandatory) {
                        attr.name = attr.name.toUpperCase();
                    }
                });
            }

            function submit() {
                AlertService.clearErrors();

                $log.debug("rpsl:" + $scope.object.rpsl);

                // parse
                var passwords = [];
                var overrides = [];
                var capitalizedAttributes = RpslService.fromRpslWithPasswords($scope.object.rpsl, passwords, overrides);
                $log.debug("capitalizedAttributes:" + JSON.stringify(capitalizedAttributes));

                var attributes = WhoisResources.wrapAttributes(
                    _.map( capitalizedAttributes, function (attr) {
                        attr.name = attr.name.toLowerCase();
                        return attr;
                    })
                );
                $log.debug("attributes:" + JSON.stringify(attributes));

                // validate
                    var enrichedAttributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, attributes);
                if( ! enrichedAttributes.validate() ) {
                    _.each(enrichedAttributes, function( item) {
                        if(item.$$error) {
                            AlertService.addGlobalError(item.name + ': ' + item.$$error );
                        }
                    });
                    return;
                }

                if( overrides.length > 0 ) {
                    // prefer override over passwords
                    passwords = undefined;
                } else {
                    // authenticate
                    if (_.isEmpty(passwords) && _.isEmpty(overrides)) {
                        // show password popup if needed
                        var objectMntners = _getObjectMntners(attributes);
                        if (MntnerService.needsPasswordAuthentication($scope.mntners.sso, [], objectMntners)) {
                            _performAuthentication(objectMntners);
                            return;
                        }
                    }
                    // combine all passwords
                    _.union( passwords, _getPasswordsForRestCall() );
                }

                // rest-put to server
                $scope.restCalInProgress = true;
                RestService.createObject($scope.object.source, $scope.object.type,
                    WhoisResources.turnAttrsIntoWhoisObject(attributes),
                    passwords, overrides).then(
                    function (result) {
                        $scope.restCalInProgress = false;

                        var whoisResources = WhoisResources.wrapWhoisResources(result);
                        MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                        _navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Create');

                    }, function (error) {
                        $scope.restCalInProgress = false;

                        if (_.isUndefined(error.data)) {
                            $log.error('Response not understood:' + JSON.stringify(error));
                            return;
                        }

                        var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                        AlertService.setAllErrors(whoisResources);
                        if (!_.isUndefined(whoisResources.getAttributes())) {
                            var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, whoisResources.getAttributes());
                            ErrorReporterService.log('Create', $scope.object.type, AlertService.getErrors(), attributes);
                        }
                    }
                );
            }

            function _performAuthentication(objectMntners) {
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication($scope.mntners.sso, [], objectMntners);
                ModalService.openAuthenticationModal($scope.source, mntnersWithPasswords).then(
                    function (result) {
                        AlertService.clearErrors();

                        var authenticatedMntner = result.selectedItem;
                        if ($scope.isMine(authenticatedMntner)) {
                            // has been successfully associated in authentication modal
                            $scope.mntners.sso.push(authenticatedMntner);
                        }
                    }, function () {
                        $state.transitionTo('webupdates.select');
                    }
                );
            }

            function _getPasswordsForRestCall() {
                var passwords = [];

                if (CredentialsService.hasCredentials()) {
                    passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                // For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
                // This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
                if ($scope.objectType === 'route' || $scope.objectType === 'route6' || $scope.objectType === 'aut-num') {
                    passwords.push('RPSL');
                }
                return passwords;
            }

            function _getObjectMntners(attributes) {
                return _.map(attributes.getAllAttributesWithValueOnName('mnt-by'), function (objMntner) {
                    // Notes:
                    // - RPSL attribute values can contain leading and traling spaces, so the must be trimmed
                    // - Assume maintainers have md5-password, so prevent unmodifyable error
                    return {type: 'mntner', key: _.trim(objMntner.value), auth: ['MD5-PW']};
                });
            }

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }
        }]);
