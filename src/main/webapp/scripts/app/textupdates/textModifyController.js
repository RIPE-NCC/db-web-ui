'use strict';

angular.module('textUpdates')
        .controller('TextModifyController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', '$q', 'WhoisResources',
        'RestService', 'AlertService','ErrorReporterService','MessageStore','RpslService', 'TextCommons', 'CredentialsService',
        'PreferenceService', 'MntnerService', 'ModalService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService, MessageStore, RpslService,
                  TextCommons, CredentialsService, PreferenceService, MntnerService, ModalService) {

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
                var noRedirect = $stateParams.noRedirect;

                $scope.mntners = {};
                $scope.mntners.sso = [];

                $log.debug('TextModifyController: Url params:' +
                    ' object.source:' + $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', object.name:' + $scope.object.name +
                    ', noRedirect:' + $scope.noRedirect);

                if( PreferenceService.isWebMode() && ! noRedirect === true ) {
                    switchToWebMode();
                }

                _fetchAndPopulateObject();
            };

            function _fetchAndPopulateObject() {
                $scope.restCalInProgress = true;

                var passwords = [];
                if (CredentialsService.hasCredentials()) {
                    $log.debug('Found password in CredentialsService');
            //        passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                $q.all({
                    mntners: RestService.fetchMntnersForSSOAccount(),
                    objectToModify: RestService.fetchObject($scope.object.source, $scope.object.type, $scope.object.name, passwords)
                }).then(
                    function (results) {
                        $scope.restCalInProgress = false;

                        $log.debug('object to modify:' + JSON.stringify(results.objectToModify));

                        // store mntners for SSO account
                        $scope.mntners.sso = results.mntners;

                        $log.debug('maintainers.sso:' + JSON.stringify($scope.mntners.sso));

                        var whoisResources = WhoisResources.wrapWhoisResources(results.objectToModify);


                        // this is where we must authenticate against
                        $scope.mntners.objectOriginal = _extractEnrichMntnersFromObject(whoisResources.getAttributes());

                        // starting point for further editing
                        $scope.mntners.object = _extractEnrichMntnersFromObject(whoisResources.getAttributes());

                        MessageStore.add('DIFF', _.cloneDeep(whoisResources.getAttributes()));

                        $scope.object.rpsl = RpslService.toRpsl(whoisResources.getAttributes());

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

            function _performAuthentication() {
                $log.debug('Perform authentication');
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication($scope.mntners.sso, $scope.mntners.objectOriginal, $scope.mntners.object);
                if (mntnersWithPasswords.length === 0) {
                    AlertService.setGlobalError('You cannot modify this object through text updates because your SSO account is not associated with any of the maintainers on this object, and none of the maintainers have a password');
                } else {
                    $log.debug('mntnersWithPasswords = ' + JSON.stringify(mntnersWithPasswords));
                    ModalService.openAuthenticationModal($scope.source, mntnersWithPasswords).then(
                        function (result) {
                            AlertService.clearErrors();

                            var selectedMntner = result.selectedItem;
                            $log.debug('selected mntner:' + JSON.stringify(selectedMntner));
                            var associationResp = result.response;
                            $log.debug('associationResp:' + JSON.stringify(associationResp));

                            if ($scope.isMine(selectedMntner)) {
                                // has been successfully associated in authentication modal

                                $scope.mntners.sso.push(selectedMntner);
                                // mark starred in selected
                                $scope.mntners.object = _enrichWithMine($scope.mntners.object);
                            }
                            $log.debug('After auth: maintainers.sso:' + JSON.stringify($scope.mntners.sso));
                            $log.debug('After auth: maintainers.object:' + JSON.stringify($scope.mntners.object));


                        }, function () {
                            $state.transitionTo('textupdates.modify');
                        }
                    );
                }
            }

            function _extractEnrichMntnersFromObject(attributes) {
                // get mntners from response
                var mntnersInObject = _.filter(attributes, function (i) {
                    return i.name === 'mnt-by';
                });

                // determine if mntner is mine
                var selected = _.map(mntnersInObject, function (mntnerAttr) {
                    return {
                        type: 'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map($scope.mntners.sso, 'key'), mntnerAttr.value)
                    };
                });

                return selected;
            }

            function _enrichWithMine(mntners) {
                return _.map(mntners, function (mntner) {
                    // search in selected list
                    if (_isMntnerOnlist($scope.mntners.sso, mntner)) {
                        mntner.mine = true;
                    } else {
                        mntner.mine = false;

                    }
                    return mntner;
                });
            }

            function _isMntnerOnlist(selectedMntners, mntner) {
                var status = _.any(selectedMntners, function (m) {
                    return m.key === mntner.key;
                });
                return status;
            }

            function submit() {

                var passwords = [];
                var overrides = [];
                var objects = RpslService.fromRpslWithPasswords($scope.object.rpsl, passwords, overrides);
                if( objects.length > 1 ) {
                    AlertService.setGlobalError('Only a single object is allowed');
                    return;
                }
                var attributes = objects[0];

                $scope.restCalInProgress = true;


                RestService.modifyObject($scope.object.source, $scope.object.type, $scope.object.name,
                    WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords).then(
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
        }]);
