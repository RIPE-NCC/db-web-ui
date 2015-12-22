'use strict';

angular.module('textUpdates')
        .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', '$q', 'WhoisResources',
        'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService', 'TextCommons', 'CredentialsService',
        'PreferenceService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore, RpslService,
                  TextCommons, CredentialsService, PreferenceService) {

            $scope.submit = submit;
            $scope.switchToWebMode = switchToWebMode;

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
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name, $scope.passwords)
                }).then(
                    function (results) {
                        $scope.restCalInProgress = false;

                        _handleFetchResponse(results.objectToModify);

                        // store mntners for SSO account
                        $scope.mntners.sso = results.mntners;
                        $log.debug('maintainers.sso:' + JSON.stringify($scope.mntners.sso));

                        $scope.object.rpsl = RpslService.toRpsl($scope.object.attributes);
                        $log.debug("RPSL:" +$scope.object.rpsl );

                        TextCommons.authenticate($scope.object.source, $scope.object.type,
                                $scope.mntners.sso, $scope.object.attributes, [], []).then(
                            function(authenticated) {
                                _refreshObjectIfNeeded($scope.object.source, $scope.object.type, $scope.object.name);
                            }
                        );

                    }
                ).catch(

                    function (error) {
                        $scope.restCalInProgress = false;
                        if (error && error.data) {
                            $log.error('Error fetching object:' + JSON.stringify(error));
                            var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                            AlertService.setErrors(whoisResources);
                        } else {
                            $log.error('Error fetching sso-mntners for SSO:' + JSON.stringify(error));
                            AlertService.setGlobalError('Error fetching maintainers associated with this SSO account');
                        }
                    }
                );
            }

            function _handleFetchResponse(objectToModify) {
                $log.debug('object to modify:' + JSON.stringify(objectToModify));
                // Extract attributes from response
                var whoisResources = WhoisResources.wrapWhoisResources(objectToModify);
                $scope.object.attributes = WhoisResources.wrapAttributes(
                    whoisResources.getAttributes()
                );
                // Needed by display screen
                MessageStore.add('DIFF', _.cloneDeep($scope.object.attributes));

            }

            function submit() {
                var overrides = [];
                var objects = RpslService.fromRpslWithPasswords($scope.object.rpsl, $scope.passwords, overrides);
                if( objects.length > 1 ) {
                    AlertService.setGlobalError('Only a single object is allowed');
                    return;
                }
                var attributes = objects[0];

                attributes = _uncapitalize(attributes);
                $log.debug("attributes:" + JSON.stringify(attributes));

                if (!TextCommons.validate($scope.object.type, attributes)) {
                    return;
                }
                if(CredentialsService.hasCredentials()) {
                    // todo: prevent duplicate password
                    $scope.passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                TextCommons.authenticate($scope.object.source, $scope.object.type, $scope.mntners.sso, attributes,
                        $scope.passwords, overrides).then(
                    function(authenticated) {

                        attributes = TextCommons.stripEmptyAttributes(attributes);

                        $scope.restCalInProgress = true;
                        RestService.modifyObject($scope.object.source, $scope.object.type, $scope.object.name,
                            WhoisResources.turnAttrsIntoWhoisObject(attributes), $scope.passwords, overrides, true).then(
                            function(result) {
                                $scope.restCalInProgress = false;

                                var whoisResources = WhoisResources.wrapWhoisResources(result);
                                MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                                _navigateToDisplayPage($scope.object.source, $scope.object.type, whoisResources.getPrimaryKey(), 'Modify');

                            },function(error) {
                                $scope.restCalInProgress = false;

                                if (_.isUndefined(error.data)) {
                                    $log.error('Response not understood:'+JSON.stringify(error));
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
                    }
                );

            }

            function _navigateToDisplayPage(source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }

            function _uncapitalize(attributes) {
                return WhoisResources.wrapAttributes(
                    _.map(attributes, function (attr) {
                        attr.name = attr.name.toLowerCase();
                        return attr;
                    })
                );
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
                    $log.debug('_refreshObjectIfNeeded: password ' + password);

                    $scope.restCalInProgress = true;
                    RestService.fetchObject(objectSource, objectType, objectName, password).then(
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
