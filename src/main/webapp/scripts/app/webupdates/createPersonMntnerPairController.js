'use strict';

angular.module('webUpdates')
    .controller('CreatePersonMntnerPairController', [
        '$scope', '$state', '$log', '$stateParams', 'WhoisResources', 'AlertService', 'UserInfoService', 'RestService', 'MessageStore',
        function ($scope, $state, $log, $stateParams, WhoisResources, AlertService, UserInfoService, RestService, MessageStore) {

            $scope.cancel = cancel;
            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.ssoUserName = undefined;

                $scope.source = $stateParams.source;

                $scope.personAttributes = WhoisResources.wrapAndEnrichAttributes('person',
                    WhoisResources.getMandatoryAttributesOnObjectType('person'));
                $scope.personAttributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                $scope.personAttributes.setSingleAttributeOnName('source', $scope.source);

                $scope.mntnerAttributes = WhoisResources.wrapAndEnrichAttributes('mntner',
                    WhoisResources.getMandatoryAttributesOnObjectType('mntner'));
                $scope.mntnerAttributes.setSingleAttributeOnName('descr', 'Startup mntner');
                $scope.mntnerAttributes.setSingleAttributeOnName('admin-c', 'AUTO-1');
                $scope.mntnerAttributes.setSingleAttributeOnName('source', $scope.source);

                // kick off ajax-call to fetch email address of logged-in user
                UserInfoService.init(_onSsoInfoAvailable);

            }

            function submit() {

                if(_.isUndefined($scope.ssoUserName)) {
                    AlertService.setGlobalError('Error fetching SSO information');
                    return;
                }

                var mntner = $scope.mntnerAttributes.getSingleAttributeOnName('mntner');
                if( !_.isUndefined(mntner.value)) {
                    $scope.personAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                    $scope.mntnerAttributes.setSingleAttributeOnName('mnt-by', mntner.value);
                }

                if (_validateForm()) {
                    AlertService.clearErrors();

                    RestService.createPersonMntner($scope.source,
                        WhoisResources.turnAttrsIntoWhoisObjects([$scope.personAttributes, $scope.mntnerAttributes])).then(
                        function(resp) {
                            var whoisResources = WhoisResources.wrapWhoisResources(resp);
                            // TODO extract both person and maintainer from response
                            var personUid = 'DW-RIPE';
                            var mntName = 'AARDVARK-MNT';

                            MessageStore.add(personUid, {});
                            MessageStore.add(mntName, {});

                            _navigateToDisplayPage($scope.source, personUid, mntName);

                        },
                        function(error) {
                            if (!error.data) {
                                // TIMEOUT: to be handled globally by response interceptor
                            } else {
                                var whoisResources = _wrapAndEnrichResources(error.config.data);
                                // TODO extract both person and maintainer errors from response
                                _validateForm();
                                AlertService.populateFieldSpecificErrors('person', $scope.personAttributes, error.config.data);
                                AlertService.populateFieldSpecificErrors('mntner', $scope.mntnerAttributes, error.config.data);
                                AlertService.setErrors(whoisResources);
                            }
                        });

                }
            }

            function cancel() {
                if ( window.confirm('Are you sure?') ) {
                    window.history.back();
                }
            }

            function _validateForm() {
                var personValid =  $scope.personAttributes.validate();
                var mntnerValid = $scope.mntnerAttributes.validate();
                return personValid && mntnerValid;
            }

            function _wrapAndEnrichResources(resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    $scope.personAttributes = WhoisResources.wrapAndEnrichAttributes('person', whoisResources.getAttributesForObjectWithIndex(0));
                    $scope.mntnerAttributes = WhoisResources.wrapAndEnrichAttributes('mntner', whoisResources.getAttributesForObjectWithIndex(1));
                }
                return whoisResources;
            }

            function _onSsoInfoAvailable() {
                $scope.ssoUserName = UserInfoService.getUsername();
                if( $scope.ssoUserName ) {
                    $scope.mntnerAttributes.setSingleAttributeOnName('auth','SSO ' + $scope.ssoUserName);
                    $scope.mntnerAttributes.setSingleAttributeOnName('upd-to',$scope.ssoUserName);
                }
            }

            function _navigateToDisplayPage(source, personName, mntnerName) {
                $state.transitionTo('displayPersonMntnerPair', {
                    source: source,
                    person: personName,
                    mntner: mntnerName
                });
            }

        }]);
