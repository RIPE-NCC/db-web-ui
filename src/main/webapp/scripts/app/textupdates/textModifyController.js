'use strict';

angular.module('textUpdates')
        .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', '$q', '$window',
        'WhoisResources', 'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService', 'TextCommons',
        'CredentialsService', 'PreferenceService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, $q, $window,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore, RpslService,
                  TextCommons, CredentialsService, PreferenceService) {

            $scope.submit = submit;
            $scope.switchToWebMode = switchToWebMode;
            $scope.cancel = cancel;
            $scope.deleteObject = deleteObject;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                // extract parameters from the url
                $scope.object = {};
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;
                $scope.object.name = decodeURIComponent($stateParams.name);
                if( !_.isUndefined($stateParams.rpsl)) {
                    $scope.object.rpsl = decodeURIComponent($stateParams.rpsl);
                }
                var noRedirect = $stateParams.noRedirect;

                $scope.mntners = {};
                $scope.mntners.sso = [];
                $scope.passwords = [];

                $log.debug('TextModifyController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', object.name:' + $scope.object.name +
                    ', noRedirect:' + $scope.noRedirect);

                if( PreferenceService.isWebMode() && ! noRedirect === true ) {
                    switchToWebMode();
                }

                if(_.isUndefined($scope.object.rpsl) ) {
                    _fetchAndPopulateObject();
                }
            };

            function _fetchAndPopulateObject() {

                // see if we have a password from a previous session
                if (CredentialsService.hasCredentials()) {
                    $log.debug('Found password in CredentialsService for fetch');
                    $scope.passwords.push(CredentialsService.getCredentials().successfulPassword);
                }
                $scope.restCalInProgress = true;
                $q.all({
                    mntners: RestService.fetchMntnersForSSOAccount(),
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name, $scope.passwords, true)
                }).then(
                    function (results) {
                        $scope.restCalInProgress = false;

                        var attributes = _handleFetchResponse(results.objectToModify);

                        // store mntners for SSO account
                        $scope.mntners.sso = results.mntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.mntners.sso));

                        TextCommons.authenticate('Modify', $scope.object.source, $scope.object.type, $scope.object.name,
                                $scope.mntners.sso, attributes, [], []).then(
                            function(authenticated) {
                                $log.error('Successfully authenticated');
                                _refreshObjectIfNeeded($scope.object.source, $scope.object.type, $scope.object.name);
                            },
                            function(authenticated) {
                                $log.error('Error authenticating');
                            }
                        );

                    }
                ).catch(
                    function (error) {
                        $scope.restCalInProgress = false;
                        if (error && error.data ) {
                            $log.error('Error fetching object:' + JSON.stringify(error));
                            var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                            AlertService.setErrors(whoisResources);
                        } else {
                            $log.error('Error interpreting responses:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        }
                    }
                );
            }

            function _handleFetchResponse(objectToModify) {
                $log.debug('object to modify:' + JSON.stringify(objectToModify));
                // Extract attributes from response
                var whoisResources = WhoisResources.wrapWhoisResources(objectToModify);
                var attributes = WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo($scope.object.type, whoisResources.getAttributes())
                );

                // Needed by display screen
                MessageStore.add('DIFF', _.cloneDeep(attributes));

                // prevent last-modfied to be in
                attributes.removeAttributeWithName('last-modified');

                $scope.object.rpsl = RpslService.toRpsl(attributes);
                $log.debug("RPSL:" +$scope.object.rpsl );

                return attributes;
            }

            function submit() {
                var overrides = [];
                var objects = RpslService.fromRpslWithPasswords($scope.object.rpsl, $scope.passwords, overrides);
                if( objects.length > 1 ) {
                    AlertService.setGlobalError('Only a single object is allowed');
                    return;
                }
                var attributes = objects[0];

                attributes = TextCommons.uncapitalize(attributes);
                $log.debug("attributes:" + JSON.stringify(attributes));

                if (!TextCommons.validate($scope.object.type, attributes)) {
                    return;
                }
                $log.error('Successfully validated');

                if(CredentialsService.hasCredentials()) {
                    // todo: prevent duplicate password
                    $scope.passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                TextCommons.authenticate('Modify', $scope.object.source, $scope.object.type, $scope.object.name, $scope.mntners.sso, attributes,
                        $scope.passwords, overrides).then(
                    function(authenticated) {
                        $log.error('Successfully authenticated');

                        // combine all passwords
                        var combinedPaswords =_.union($scope.passwords, TextCommons.getPasswordsForRestCall( $scope.object.type));

                        attributes = TextCommons.stripEmptyAttributes(attributes);

                        $scope.restCalInProgress = true;
                        RestService.modifyObject($scope.object.source, $scope.object.type, $scope.object.name,
                            WhoisResources.turnAttrsIntoWhoisObject(attributes), combinedPaswords, overrides, true).then(
                            function(result) {
                                $scope.restCalInProgress = false;

                                var whoisResources = WhoisResources.wrapWhoisResources(result);
                                MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                                _navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Modify');

                            },
                            function(error) {
                                $scope.restCalInProgress = false;

                                if (_.isUndefined(error.data) || (_.isUndefined(error.data.objects) && _.isUndefined(error.data.errormessages) )) {
                                    $log.error('Response not understood:'+JSON.stringify(error));
                                    AlertService.setGlobalError('Error submitting information: Unexpected response');
                                    return;
                                }

                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                AlertService.setAllErrors(whoisResources);

                                if(!_.isUndefined(whoisResources.getAttributes())) {
                                    var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, whoisResources.getAttributes());
                                    ErrorReporterService.log('Modify', $scope.object.type, AlertService.getErrors(), attributes);
                                }

                            }
                        );
                    },
                    function(authenticated) {
                        $log.error('Error authenticating');
                    }
                );

            }

            function cancel() {
                if ($window.confirm('You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.')) {
                    _navigateToDisplayPage($scope.object.source, $scope.object.type, $scope.object.name, undefined);
                }
            }

            function deleteObject() {
                TextCommons.navigateToDelete($scope.object.source, $scope.object.type, $scope.object.name, 'textupdates.modify');
            }

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }

           function switchToWebMode() {
                $log.debug("Switching to web-mode");

                PreferenceService.setWebMode();

                $state.transitionTo('webupdates.modify', {
                    source: $scope.object.source,
                    objectType: $scope.object.type,
                    name:$scope.object.name,
                });
            }

            function _refreshObjectIfNeeded(objectSource, objectType, objectName) {
                $log.debug('_refreshObjectIfNeeded:' + objectType);
                if (objectType === 'mntner') {
                    var password = null;
                    if (CredentialsService.hasCredentials()) {
                        password = CredentialsService.getCredentials().successfulPassword;
                    }

                    $scope.restCalInProgress = true;
                    RestService.fetchObject(objectSource, objectType, objectName, password, true).then(
                        function (result) {
                            $scope.restCalInProgress = false;
                            _handleFetchResponse(result);
                        },
                        function(error) {
                            $scope.restCalInProgress = false;
                            // ignore
                        }
                    );
                }
            }
        }]);
